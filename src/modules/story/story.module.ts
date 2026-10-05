import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story } from './story.entity';
import { UserModule } from '../user/user.module';
import { UserAdminGuard } from 'src/common/guards/user-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Story]), UserModule],
  controllers: [StoryController],
  providers: [
    StoryService,
    UserAdminGuard
  ],
  exports: [StoryService]
})
export class StoryModule {}
