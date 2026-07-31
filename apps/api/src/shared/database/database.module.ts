import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
    console.log('database.uri:', configService.get('database.uri'));
    console.log('MONGODB_URI:', configService.get('MONGODB_URI'));

    return {
      uri: configService.get<string>('MONGODB_URI'),
    };
  },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
