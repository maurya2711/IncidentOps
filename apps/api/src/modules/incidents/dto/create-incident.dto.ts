import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IncidentSeverity, IncidentStatus } from '@incidentops/shared';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsMongoId()
  @IsOptional()
  assignee?: string;

  @IsMongoId()
  @IsOptional()
  service?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
