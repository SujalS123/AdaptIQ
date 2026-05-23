import { createClient } from 'redis';
import { env } from './env';

let redisClient: any = null;

export const connectRedis = async (): Promise<any> => {
  try {
    const client = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: () => false, // Stop reconnecting to prevent infinite console spam on failure
      }
    });

    client.on('error', (err) => {
      if (redisClient === client) {
        console.warn('⚠️ Redis client error:', err.message);
      }
    });

    await client.connect();
    redisClient = client;
    console.log('💚 Connected to Redis successfully.');
    return client;
  } catch (error) {
    console.warn('⚠️ Redis connection failed. Falling back to local offline in-memory cache.');
    // In-memory mock Redis client
    const mockStore: Record<string, string> = {};
    redisClient = {
      get: async (key: string) => mockStore[key] || null,
      set: async (key: string, val: string, options?: any) => {
        mockStore[key] = val;
        return 'OK';
      },
      del: async (key: string) => {
        delete mockStore[key];
        return 1;
      },
      on: () => {},
      quit: async () => {},
    };
    return redisClient;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    // If not connected, return basic in-memory mock client immediately
    const mockStore: Record<string, string> = {};
    redisClient = {
      get: async (key: string) => mockStore[key] || null,
      set: async (key: string, val: string) => {
        mockStore[key] = val;
        return 'OK';
      },
      del: async (key: string) => {
        delete mockStore[key];
        return 1;
      },
      on: () => {},
      quit: async () => {},
    };
  }
  return redisClient;
};
