import { Module } from '@nestjs/common';

import { StoryContentController } from './story-content.controller';
import { StoryContentService } from './story-content.service';
import { StoryContent } from './story-content.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StoryContent])],
  controllers: [StoryContentController],
  providers: [StoryContentService],
  exports: [StoryContentService]
})
export class StoryContentModule {}
