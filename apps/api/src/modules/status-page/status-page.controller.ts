import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators';
import { StatusPageService } from './status-page.service';

@ApiTags('Status Page')
@Controller('status')
export class StatusPageController {
  constructor(private readonly statusPageService: StatusPageService) {}

  @Public()
  @Get()
  getOverallStatus() {
    return this.statusPageService.getOverallStatus();
  }

  @Public()
  @Get('services')
  getServices() {
    return this.statusPageService.getServices();
  }

  @Public()
  @Get('incidents')
  getActiveIncidents() {
    return this.statusPageService.getActiveIncidents();
  }

  @Public()
  @Get('history')
  getIncidentHistory(@Query('days') days = 30) {
    return this.statusPageService.getIncidentHistory(+days);
  }

  @Public()
  @Get('uptime')
  getUptime() {
    return this.statusPageService.getUptime90Days();
  }
}
