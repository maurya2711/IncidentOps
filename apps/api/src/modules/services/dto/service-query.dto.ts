import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { ServiceStatus } from '@incidentops/shared';

export class ServiceQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  team?: string;
}

export class AddMetricDto {
  @IsNumber()
  @Min(0)
  latency: number;

  @IsNumber()
  @Min(0)
  errorRate: number;

  @IsNumber()
  @Min(0)
  requestCount: number;
}
