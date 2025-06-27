import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { getOptimizedUrl } from '../config/cloudinary';
import { getCache, setCache } from '../config/redis';
import compression from 'compression';
import zlib from 'zlib';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CACHE_DURATION = 7200; // 2 hours
const CACHE_PREFIX = 'qr:landing:';
const PREWARM_BATCH_SIZE = 100; // Increased from 50 to 100
const MEMORY_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (increased from 5)

// In-memory cache for frequently accessed QR codes with LRU eviction
class LRUCache {
  private cache: Map<string, { data: any, timestamp: number }>;
  private maxSize: number;
  private accessOrder: string[];

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  get(key: string) {
    const value = this.cache.get(key);
    if (value) {
      // Update access order
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
    }
    return value;
  }

  set(key: string, value: { data: any, timestamp: number }) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
    this.accessOrder.push(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
}

// Initialize LRU cache with 2000 items capacity (increased from 1000)
const memoryCache = new LRUCache(2000);

// Track most accessed QR codes for prewarming
const accessCounter = new Map<string, number>();
const TOP_ACCESSED_SIZE = 200; // Increased from 100

// Batch update queue for scan stats
const scanStatsQueue = new Map<string, { count: number, history: any[] }>();
const BATCH_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

// Prewarm cache for most accessed QR codes
async function prewarmCache() {
  try {
    // Get top accessed QR codes
    const topAccessed = Array.from(accessCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, PREWARM_BATCH_SIZE)
      .map(([id]) => id);

    if (topAccessed.length === 0) return;

    // Fetch QR codes in batch with optimized query
    const qrCodes = await qrCodeRepository
      .createQueryBuilder('qr')
      .select([
        'qr.id',
        'qr.name',
        'qr.logoUrl',
        'qr.foregroundColor',
        'qr.backgroundColor',
        'qr.links',
        'qr.menu',
        'qr.products',
        'qr.type',
        'qr.originalUrl',
        'qr.updatedAt',
        'qr.vitrine'
      ])
      .leftJoinAndSelect('qr.user', 'user', 'user.isActive = :isActive', { isActive: true })
      .where('qr.id IN (:...ids)', { ids: topAccessed })
      .cache(true)
      .getMany();

    // Update caches in parallel
    await Promise.all(qrCodes.map(async (qrCode) => {
      const cacheKey = `${CACHE_PREFIX}${qrCode.id}`;
      memoryCache.set(cacheKey, {
        data: qrCode,
        timestamp: Date.now()
      });
      await setCache(cacheKey, qrCode, CACHE_DURATION);
    }));

    console.log(`Prewarmed cache for ${qrCodes.length} QR codes`);
  } catch (error) {
    console.error('Error prewarming cache:', error);
  }
}

// Prewarm cache periodically
setInterval(prewarmCache, 5 * 60 * 1000); // Every 5 minutes

// Clean up old entries from memory cache
setInterval(() => {
  const now = Date.now();
  memoryCache.clear(); // Clear and let LRU handle the rest
}, 60 * 1000); // Clean up every minute

// Process batch updates
async function processBatchUpdates() {
  if (scanStatsQueue.size === 0) return;

  try {
    const updates = Array.from(scanStatsQueue.entries()).map(([id, stats]) => ({
      id,
      scanCount: stats.count,
      scanHistory: stats.history
    }));

    // Batch update using TypeORM with optimized query
    await qrCodeRepository
      .createQueryBuilder()
      .update(QRCode)
      .set({
        scanCount: () => `scan_count + 1`,
        scanHistory: () => `array_append(scan_history, :history)`
      })
      .whereInIds(updates.map(u => u.id))
      .setParameter('history', JSON.stringify(updates[0].scanHistory))
      .execute();

    // Clear the queue
    scanStatsQueue.clear();
  } catch (error) {
    console.error('Error processing batch updates:', error);
  }
}

// Start batch update interval
setInterval(processBatchUpdates, BATCH_UPDATE_INTERVAL);

// Helper function to queue scan stats
function queueScanStats(id: string, req: Request) {
  // Update access counter
  accessCounter.set(id, (accessCounter.get(id) || 0) + 1);
  
  // Keep only top accessed QR codes
  if (accessCounter.size > TOP_ACCESSED_SIZE) {
    const entries = Array.from(accessCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_ACCESSED_SIZE);
    accessCounter.clear();
    entries.forEach(([id, count]) => accessCounter.set(id, count));
  }

  const currentStats = scanStatsQueue.get(id) || { count: 0, history: [] };
  scanStatsQueue.set(id, {
    count: currentStats.count + 1,
    history: [...currentStats.history, {
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || 'Unknown'
    }]
  });
}

// Optimized cache headers with shorter max-age
function setAggressiveCacheHeaders(res: Response, data: any) {
  // Set cache control headers with shorter max-age for faster updates
  res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
  res.setHeader('ETag', `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`);
  res.setHeader('Vary', 'Accept-Encoding');
}

// Optimized response streaming with faster compression
function streamResponse(res: Response, data: any, acceptsGzip: boolean | undefined) {
  if (acceptsGzip === true) {
    res.setHeader('Content-Encoding', 'gzip');
    const gzip = zlib.createGzip({
      level: 1, // Faster compression
      memLevel: 4 // Lower memory usage
    });
    gzip.pipe(res);
    gzip.write(JSON.stringify(data));
    gzip.end();
  } else {
    res.json(data);
  }
}

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_PREFIX}${id}`;
    
    // Check if client accepts gzip
    const acceptsGzip = req.headers['accept-encoding']?.includes('gzip');
    
    // Check ETag for client-side caching
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch) {
      const cachedData = memoryCache.get(cacheKey)?.data;
      if (cachedData) {
        const etag = `"${Buffer.from(JSON.stringify(cachedData)).toString('base64')}"`;
        if (ifNoneMatch === etag) {
          return res.status(304).end();
        }
      }
    }

    // 1. Check memory cache first (fastest)
    const memoryCached = memoryCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_DURATION) {
      // Queue scan stats update asynchronously
      queueScanStats(id, req);
      
      // Set aggressive cache headers
      setAggressiveCacheHeaders(res, memoryCached.data);
      
      // Stream response with compression
      return streamResponse(res, memoryCached.data, acceptsGzip);
    }
    
    // 2. Check Redis cache
    const cachedQRCode = await getCache(cacheKey);
    if (cachedQRCode) {
      // Update memory cache
      memoryCache.set(cacheKey, {
        data: cachedQRCode,
        timestamp: Date.now()
      });
      
      // Queue scan stats update asynchronously
      queueScanStats(id, req);
      
      // Set aggressive cache headers
      setAggressiveCacheHeaders(res, cachedQRCode);
      
      // Stream response with compression
      return streamResponse(res, cachedQRCode, acceptsGzip);
    }

    // 3. Database query with optimized fields and connection pooling
    const qrCode = await qrCodeRepository
      .createQueryBuilder('qr')
      .select([
        'qr.id',
        'qr.name',
        'qr.logoUrl',
        'qr.foregroundColor',
        'qr.backgroundColor',
        'qr.links',
        'qr.menu',
        'qr.products',
        'qr.type',
        'qr.originalUrl',
        'qr.updatedAt',
        'qr.vitrine'
      ])
      .leftJoinAndSelect('qr.user', 'user', 'user.isActive = :isActive', { isActive: true })
      .where('qr.id = :id', { id })
      .cache(true) // Enable query caching
      .getOne();

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if user is active
    if (!qrCode.user?.isActive) {
      const frontendDomain = process.env.FRONTEND_URL || 'http://localhost:8080';
      return res.redirect(`${frontendDomain}/payment-instructions`);
    }

    // Queue scan stats update asynchronously
    queueScanStats(id, req);

    // Update both caches asynchronously
    Promise.all([
      setCache(cacheKey, qrCode, CACHE_DURATION),
      memoryCache.set(cacheKey, {
        data: qrCode,
        timestamp: Date.now()
      })
    ]).catch(console.error);

    // Set aggressive cache headers
    setAggressiveCacheHeaders(res, qrCode);

    // Stream response with compression
    return streamResponse(res, qrCode, acceptsGzip);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
