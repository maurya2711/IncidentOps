import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ServiceStatus } from '@incidentops/shared';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceStatus)
  @IsOptional()
  status?: ServiceStatus;

  @IsMongoId()
  @IsOptional()
  team?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  uptime?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  latency?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  errorRate?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
