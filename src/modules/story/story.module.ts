import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { Story } from './story.entity';
import { UserModule } from '../user/user.module';
import { UserAdminGuard } from '../user/guards/user-admin.guard';
import { StoryContentModule } from './story-content/story-content.module';
import { StoryReviewModule } from './story-review/story-review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story]),
    UserModule,
    StoryContentModule,
    forwardRef(() => StoryReviewModule),
  ],
  controllers: [StoryController],
  providers: [StoryService, UserAdminGuard],
  exports: [StoryService]
})
export class StoryModule {}
