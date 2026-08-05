import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { GlobalExceptionFilter, TransformInterceptor } from './common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log('Current Working Directory:', process.cwd());
  console.log('MONGODB_URI++++:', process.env.MONGODB_URI);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 4000;
  const rawFrontendUrl = configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
  const cleanFrontendUrl = rawFrontendUrl.replace(/\/$/, '');
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  const allowedOrigins = [cleanFrontendUrl, 'http://localhost:3000', 'http://localhost:4000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const clean = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(clean) ||
        clean.endsWith('.vercel.app') ||
        clean.includes('localhost')
      ) {
        return callback(null, true);
      }
      logger.warn(`CORS request from origin: ${origin}`);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(app.get(TransformInterceptor));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('IncidentOps API')
    .setDescription('Enterprise Incident Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  logger.log(`IncidentOps API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs at http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
