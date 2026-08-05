import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TeamRole } from '@incidentops/shared';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slackChannel?: string;
}

export class AddMemberDto {
  @IsMongoId()
  userId: string;

  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole;
}

export class UpdateMemberDto {
  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
