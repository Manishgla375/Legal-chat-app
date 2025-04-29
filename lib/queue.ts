import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";

if (!process.env.UPSTASH_REDIS_REST_URL) {
  console.error('Redis configuration missing:', {
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL
  });
  throw new Error('UPSTASH_REDIS_REST_URL must be set');
}

let connection: IORedis | null = null;

try {
  connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  });

  connection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  connection.on('connect', () => {
    console.log('Redis connection established');
  });
} catch (error) {
  console.error('Failed to initialize Redis connection:', error);
  throw error;
}

if (!connection) {
  throw new Error('Failed to initialize Redis connection');
}

export const messageQueue = new Queue("message-queue", { connection });

export async function startMessageWorker() {
  if (!connection) {
    throw new Error('Redis connection not available');
  }

  new Worker(
    "message-queue",
    async (job) => {
      const { chatId, content, role } = job.data;
      await db.insert(messages).values({
        id: uuidv4(),
        chatId,
        role,
        content,
        createdAt: new Date(),
      });
    },
    { connection }
  );
}