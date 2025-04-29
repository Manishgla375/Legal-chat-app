import { Redis as UpstashRedis } from '@upstash/redis';

let redisClient: UpstashRedis | null = null;

// Helper function to get the appropriate Redis client
export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Redis configuration missing:', {
      hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
    });
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  }

  try {
    redisClient = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });

    // Test the connection
    redisClient.ping().catch(err => {
      console.error('Redis connection test failed:', err);
      redisClient = null;
      throw err;
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    throw error;
  }
} 