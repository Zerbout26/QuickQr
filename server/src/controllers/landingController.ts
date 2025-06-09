import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { getOptimizedUrl } from '../config/cloudinary';
import { getCache, setCache } from '../config/redis';

const qrCodeRepository = AppDataSource.getRepository(QRCode);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CACHE_DURATION = 300; // 5 minutes in seconds

// Batch update queue for scan stats
const scanStatsQueue = new Map<string, { count: number, history: any[] }>();
const BATCH_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

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

export const getLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check Redis cache first
    const cacheKey = `qr:${id}`;
    const cachedQRCode = await getCache(cacheKey);
    
    if (cachedQRCode) {
      // Queue scan stats update
      const currentStats = scanStatsQueue.get(id) || { count: 0, history: [] };
      scanStatsQueue.set(id, {
        count: currentStats.count + 1,
        history: [...currentStats.history, {
          timestamp: new Date(),
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: req.ip || 'Unknown'
        }]
      });

      // Set optimized cache headers
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('ETag', `"${cachedQRCode.id}-${cachedQRCode.updatedAt}"`);
      res.setHeader('Vary', 'Accept-Encoding');

      return res.json(cachedQRCode);
    }

    // Optimized database query with specific fields and relations
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

    // Queue scan stats update
    const currentStats = scanStatsQueue.get(id) || { count: 0, history: [] };
    scanStatsQueue.set(id, {
      count: currentStats.count + 1,
      history: [...currentStats.history, {
        timestamp: new Date(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      }]
    });

    // Cache the QR code in Redis
    await setCache(cacheKey, qrCode, CACHE_DURATION);

    // Set optimized cache headers
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.setHeader('ETag', `"${qrCode.id}-${qrCode.updatedAt}"`);
    res.setHeader('Vary', 'Accept-Encoding');

    // Return the QR code data
    return res.json(qrCode);
  } catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
