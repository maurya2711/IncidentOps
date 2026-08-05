import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Overall analytics summary KPIs' })
  getSummary(@Query('days') days: number = 30) {
    return this.analyticsService.getSummary(+days);
  }

  @Get('incident-trend')
  @ApiOperation({ summary: 'Incident created vs resolved per day' })
  getIncidentTrend(@Query('days') days: number = 30) {
    return this.analyticsService.getIncidentTrend(+days);
  }

  @Get('mttr')
  @ApiOperation({ summary: 'MTTR by severity' })
  getMttr(@Query('days') days: number = 30) {
    return this.analyticsService.getMttrBySeverity(+days);
  }

  @Get('incidents-by-severity')
  @ApiOperation({ summary: 'Incident count grouped by severity' })
  getIncidentsBySeverity(@Query('days') days: number = 30) {
    return this.analyticsService.getIncidentsBySeverity(+days);
  }

  @Get('top-failing-services')
  @ApiOperation({ summary: 'Services with most incidents' })
  getTopFailingServices(@Query('limit') limit: number = 10) {
    return this.analyticsService.getTopFailingServices(+limit);
  }

  @Get('sla-compliance')
  @ApiOperation({ summary: 'SLA compliance by severity' })
  getSlaCompliance(@Query('days') days: number = 30) {
    return this.analyticsService.getSlaCompliance(+days);
  }
}
