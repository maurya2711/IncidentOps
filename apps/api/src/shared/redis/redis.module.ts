import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const password = configService.get<string>('redis.password');
        const redis = new Redis({
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          ...(password ? { password } : {}),
          maxRetriesPerRequest: null,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.warn('Redis connection failed after 3 attempts. Running without Redis cache.');
              return null; // Stop retrying
            }
            logger.warn(`Redis connection attempt ${times} failed`);
            return Math.min(times * 50, 2000);
          },
        });

        redis.on('error', (err) => {
          // Only log once to avoid spam
          if (err.message && !err.message.includes('ECONNREFUSED')) {
            logger.warn(`Redis connection error: ${err.message}. Running without Redis cache.`);
          }
        });

        redis.on('connect', () => {
          logger.log('Redis connected successfully');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
