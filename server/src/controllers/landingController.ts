import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { getOptimizedUrl } from '../config/cloudinary';
import { getCache, setCache } from '../config/redis';
import compression from 'compression';
import zlib from 'zlib';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CACHE_DURATION = 3600; // 1 hour
const CACHE_PREFIX = 'qr:landing:';
const PREWARM_BATCH_SIZE = 50; // Number of QR codes to prewarm at once

// In-memory cache for frequently accessed QR codes
const memoryCache = new Map<string, { data: any, timestamp: number }>();
const MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track most accessed QR codes for prewarming
const accessCounter = new Map<string, number>();
const TOP_ACCESSED_SIZE = 100;

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

    // Fetch QR codes in batch
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
        'qr.type',
        'qr.originalUrl',
        'qr.updatedAt',
        'qr.vitrine'
      ])
      .leftJoinAndSelect('qr.user', 'user', 'user.isActive = :isActive', { isActive: true })
      .where('qr.id IN (:...ids)', { ids: topAccessed })
      .cache(true)
      .getMany();

    // Update caches
    for (const qrCode of qrCodes) {
      const cacheKey = `${CACHE_PREFIX}${qrCode.id}`;
      memoryCache.set(cacheKey, {
        data: qrCode,
        timestamp: Date.now()
      });
      await setCache(cacheKey, qrCode, CACHE_DURATION);
    }

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
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > MEMORY_CACHE_DURATION) {
      memoryCache.delete(key);
    }
  }
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

// Helper function to set aggressive cache headers
function setAggressiveCacheHeaders(res: Response, data: any) {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
  res.setHeader('ETag', `"${data.id}-${data.updatedAt}"`);
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Surrogate-Control', 'max-age=3600');
  res.setHeader('Surrogate-Key', `qr-${data.id}`);
}

// Helper function to compress response
function compressResponse(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(JSON.stringify(data), (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_PREFIX}${id}`;
    
    // Check if client accepts gzip
    const acceptsGzip = req.headers['accept-encoding']?.includes('gzip');
    
    // 1. Check memory cache first (fastest)
    const memoryCached = memoryCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_DURATION) {
      // Queue scan stats update asynchronously
      queueScanStats(id, req);
      
      // Set aggressive cache headers
      setAggressiveCacheHeaders(res, memoryCached.data);
      
      if (acceptsGzip) {
        res.setHeader('Content-Encoding', 'gzip');
        const compressed = await compressResponse(memoryCached.data);
        return res.send(compressed);
      }
      
      return res.json(memoryCached.data);
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
      
      if (acceptsGzip) {
        res.setHeader('Content-Encoding', 'gzip');
        const compressed = await compressResponse(cachedQRCode);
        return res.send(compressed);
      }
      
      return res.json(cachedQRCode);
    }

    // 3. Database query with optimized fields
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

    // Compress response if client accepts gzip
    if (acceptsGzip) {
      res.setHeader('Content-Encoding', 'gzip');
      const compressed = await compressResponse(qrCode);
      return res.send(compressed);
    }

    // Return the QR code data
    return res.json(qrCode);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
