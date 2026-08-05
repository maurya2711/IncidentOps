import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MailModule } from '../../shared/mail/mail.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
