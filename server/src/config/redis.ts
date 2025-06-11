import Redis from 'ioredis';

let redisClient: Redis | null = null;

// Only initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redisClient.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
    // If Redis fails, set client to null to use database caching
    redisClient = null;
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });
} else {
  console.log('Redis URL not provided, using database caching');
}

export const getCache = async (key: string): Promise<any> => {
  if (!redisClient) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis Get Error:', error);
    return null;
  }
};

export const setCache = async (key: string, value: any, expirySeconds: number = 300): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', expirySeconds);
  } catch (error) {
    console.error('Redis Set Error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis Delete Error:', error);
  }
};

export default redisClient; 