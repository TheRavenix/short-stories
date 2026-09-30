import { Controller, Get, Param } from '@nestjs/common';

import { StoryContentService } from './story-content.service';

@Controller('story-contents')
export class StoryContentController {
  constructor(private storyContentService: StoryContentService) {}

  @Get(':storyId')
  findOneByStoryId(@Param('storyId') storyId: string) {
    return this.storyContentService.findOneBy({
      storyId: parseInt(storyId)
    })
  }
}
