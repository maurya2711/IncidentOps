import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { AddMetricDto, ServiceQueryDto } from './dto/service-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services' })
  findAll(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Get('status-summary')
  @ApiOperation({ summary: 'Get status count summary' })
  getStatusSummary() {
    return this.servicesService.getStatusSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single service' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Post(':id/metrics')
  @ApiOperation({ summary: 'Push a new metric data point' })
  addMetric(@Param('id') id: string, @Body() addMetricDto: AddMetricDto) {
    return this.servicesService.addMetric(id, addMetricDto);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get service metrics' })
  getMetrics(@Param('id') id: string, @Query('days') days: number = 7) {
    return this.servicesService.getMetrics(id, days);
  }

  @Public()
  @Get('badge/:token')
  @ApiOperation({ summary: 'Get service status by badge token (public)' })
  getByBadgeToken(@Param('token') token: string) {
    return this.servicesService.findByBadgeToken(token);
  }
}
