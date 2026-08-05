import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IncidentSchema } from '../incidents/schemas/incident.schema';
import { ServiceSchema } from '../services/schemas/service.schema';
import { StatusPageController } from './status-page.controller';
import { StatusPageService } from './status-page.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Service', schema: ServiceSchema },
      { name: 'Incident', schema: IncidentSchema },
    ]),
  ],
  controllers: [StatusPageController],
  providers: [StatusPageService],
})
export class StatusPageModule {}
