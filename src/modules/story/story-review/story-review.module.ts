import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoryReviewController } from './story-review.controller';
import { StoryReviewService } from './story-review.service';
import { StoryReview } from './story-review.entity';
import { UserModule } from '../../user/user.module';
import { StoryModule } from '../story.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoryReview]),
    UserModule,
    StoryModule
  ],
  controllers: [StoryReviewController],
  providers: [StoryReviewService],
  exports: [StoryReviewService]
})
export class StoryReviewModule {}
