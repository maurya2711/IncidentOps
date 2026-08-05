import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IncidentSchema } from '../incidents/schemas/incident.schema';
import { ServiceSchema } from '../services/schemas/service.schema';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Incident', schema: IncidentSchema },
      { name: 'Service', schema: ServiceSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
