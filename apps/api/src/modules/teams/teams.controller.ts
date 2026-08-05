import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddMemberDto, CreateTeamDto, UpdateMemberDto } from './dto/team.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto, @Req() req: any) {
    return this.teamsService.create(dto, req.user._id ?? req.user.sub);
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTeamDto>) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.teamsService.addMember(id, dto);
  }

  @Patch(':id/members/:userId')
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.teamsService.updateMember(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
