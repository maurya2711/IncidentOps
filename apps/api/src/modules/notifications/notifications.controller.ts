import { Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  findAll(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notificationsService.findAll(req.user.sub, +page, +limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  delete(@Req() req: any, @Param('id') id: string): Promise<any> {
    return this.notificationsService.deleteNotification(req.user.sub, id);
  }
}
