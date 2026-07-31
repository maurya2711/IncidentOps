import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  smtpConfig,
  validationSchema,
} from './config';
import { GlobalExceptionFilter, TransformInterceptor, JwtAuthGuard } from './common';
import { DatabaseModule, RedisModule, QueueModule } from './shared';
import { MailModule } from './shared/mail/mail.module';
import {
  AuthModule,
  UsersModule,
  IncidentsModule,
  ServicesModule,
  TeamsModule,
  AnalyticsModule,
  NotificationsModule,
  SettingsModule,
  StatusPageModule,
} from './modules';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, smtpConfig],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    RedisModule,
    QueueModule,
    AuthModule,
    UsersModule,
    IncidentsModule,
    ServicesModule,
    TeamsModule,
    AnalyticsModule,
    NotificationsModule,
    SettingsModule,
    StatusPageModule,
    MailModule,
  ],
  controllers: [HealthController],
  providers: [
    GlobalExceptionFilter,
    TransformInterceptor,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
