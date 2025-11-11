import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private pubSub: RedisPubSub;

  async onModuleInit() {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          this.logger.warn(`Redis reconnecting... attempt ${times}`);
          return delay;
        },
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.pubSub = new RedisPubSub({
        publisher: new Redis({
          host: redisHost,
          port: redisPort,
        }),
        subscriber: new Redis({
          host: redisHost,
          port: redisPort,
        }),
      });

      this.logger.log('Redis PubSub initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    }
    if (this.pubSub) {
      await this.pubSub.close();
      this.logger.log('Redis PubSub closed');
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getPubSub(): RedisPubSub {
    return this.pubSub;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setex(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.redisClient.sadd(key, member);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, member);
    return result === 1;
  }

  async srem(key: string, member: string): Promise<void> {
    await this.redisClient.srem(key, member);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redisClient.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hgetall(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }
}
