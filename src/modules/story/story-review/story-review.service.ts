import { Injectable, NotFoundException } from '@nestjs/common'
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { StoryReview } from './story-review.entity'
import { CreateStoryReviewDto } from './story-review.dto'

@Injectable()
export class StoryReviewService {
  constructor(
    @InjectRepository(StoryReview)
    private storyReviewRepository: Repository<StoryReview>
  ) {}

  find(options?: FindManyOptions<StoryReview>) {
    return this.storyReviewRepository.find(options)
  }

  findOneBy(where: FindOptionsWhere<StoryReview>) {
    return this.storyReviewRepository.findOneBy(where)
  }

  async findOneByOrFail(where: FindOptionsWhere<StoryReview>) {
    const review = await this.storyReviewRepository.findOneBy(where)

    if (review === null) {
      throw new NotFoundException({
        message: 'Story review not found'
      })
    }

    return review
  }

  // Isn't this should be handeled in the client?
  getRatingCount(stars: number[]) {
    return (
      stars.reduce((a, b) => {
        return a + b
      }, 0) / stars.length || 0
    )
  }

  // Isn't this should be handeled in the client?
  async findRatingCountByStoryId(storyId: number) {
    const storyReviews = await this.storyReviewRepository.find({
      where: {
        storyId
      },
      select: {
        stars: true
      }
    })
    return this.getRatingCount(storyReviews.map((review) => review.stars))
  }

  create(dto: CreateStoryReviewDto, userId: number, storyId: number) {
    const review = this.storyReviewRepository.create({
      ...dto,
      userId,
      storyId
    })
    return this.storyReviewRepository.save(review)
  }

  update(
    where: FindOptionsWhere<StoryReview>,
    update: Partial<StoryReview>
  ) {
    return this.storyReviewRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<StoryReview>) {
    return this.storyReviewRepository.delete(where)
  }
}
