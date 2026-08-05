import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddCommentDto } from './dto/add-comment.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() createIncidentDto: CreateIncidentDto, @Req() req: any) {
    return this.incidentsService.create(createIncidentDto, req.user.sub ?? req.user._id);
  }

  @Get()
  findAll(@Query() query: IncidentQueryDto) {
    return this.incidentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentDto, @Req() req: any) {
    return this.incidentsService.update(id, updateIncidentDto, req.user.sub ?? req.user._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() addCommentDto: AddCommentDto, @Req() req: any) {
    return this.incidentsService.addComment(id, addCommentDto, req.user.sub ?? req.user._id);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.incidentsService.getComments(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.incidentsService.getTimeline(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.incidentsService.addAttachment(id, file, req.user.sub ?? req.user._id);
  }
}
