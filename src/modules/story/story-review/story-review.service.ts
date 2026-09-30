import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { StoryReview } from './story-review.entity';
import { CreateStoryReviewDto } from './story-review.dto';

@Injectable()
export class StoryReviewService {
  constructor(
    @InjectRepository(StoryReview)
    private storyReviewRepository: Repository<StoryReview>
  ) {}

  find(where: FindOptionsWhere<StoryReview> = {}) {
    return this.storyReviewRepository.find({ where })
  }

  findOneBy(where: FindOptionsWhere<StoryReview> = {}) {
    return this.storyReviewRepository.findOneBy(where)
  }

  async findOneByOrFail(where: FindOptionsWhere<StoryReview> = {}) {
    const review = await this.storyReviewRepository.findOneBy(where)

    if (review === null) {
      throw new NotFoundException({
        message: 'Story review not found'
      })
    }

    return review
  }

  async getStoryRatingCount(storyId: number) {
    const storyReviews = await this.storyReviewRepository.find({
      where: {
        storyId
      },
      select: {
        stars: true
      }
    })
    return (
      storyReviews.reduce((a, b) => {
        return a + b.stars
      }, 0) / storyReviews.length || 0
    )
  }

  create(dto: CreateStoryReviewDto, userId: number) {
    const story = this.storyReviewRepository.create({
      ...dto,
      userId
    })
    return this.storyReviewRepository.save(story)
  }

  update(
    where: FindOptionsWhere<StoryReview> = {},
    update: Partial<StoryReview> = {},
  ) {
    return this.storyReviewRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<StoryReview> = {}) {
    return this.storyReviewRepository.delete(where)
  }
}
