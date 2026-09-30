import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { StoryContent } from './story-content.entity';
import { CreateStoryContentDto } from './story-content.dto';

@Injectable()
export class StoryContentService {
  constructor(
    @InjectRepository(StoryContent)
    private storyContentRepository: Repository<StoryContent>
  ) {}

  find(where: FindOptionsWhere<StoryContent> = {}) {
    return this.storyContentRepository.find({ where })
  }

  findOneBy(where: FindOptionsWhere<StoryContent> = {}) {
    return this.storyContentRepository.findOneBy(where)
  }

  async findOneByOrFail(where: FindOptionsWhere<StoryContent> = {}) {
    const content = await this.storyContentRepository.findOneBy(where)

    if (content === null) {
      throw new NotFoundException({
        message: 'Story content not found'
      })
    }

    return content
  }

  create(dto: CreateStoryContentDto) {
    const story = this.storyContentRepository.create({
      ...dto
    })
    return this.storyContentRepository.save(story)
  }

  update(
    where: FindOptionsWhere<StoryContent> = {},
    update: Partial<StoryContent> = {}
  ) {
    return this.storyContentRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<StoryContent> = {}) {
    return this.storyContentRepository.delete(where)
  }
}
