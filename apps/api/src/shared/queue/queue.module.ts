import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('QueueModule');
        const password = configService.get<string>('redis.password');
        return {
          connection: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
            ...(password ? { password } : {}),
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
              if (times > 3) {
                logger.warn('Queue Redis connection failed after 3 attempts. Running without queue.');
                return null; // Stop retrying
              }
              logger.warn(`Queue Redis connection attempt ${times} failed`);
              return Math.min(times * 50, 2000);
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
