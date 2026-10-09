import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'

import { StoryReviewService } from './story-review.service'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CurrentUser } from '../../user/decorators/current-user.decorator'
import { CurrentUserType } from '../../user/user.types'
import { CreateStoryReviewDto, EditStoryReviewDto } from './story-review.dto'
import { UserService } from '../../user/user.service'
import { StoryService } from '../story.service'
import { StoryReviewDetails, StoryReviewsRating } from './story-review.types'
import { StoryReview } from './story-review.entity'
import { GetLibraryStoriesDto } from '../story.dto'

@Controller('story-reviews')
export class StoryReviewController {
  constructor(
    private storyReviewService: StoryReviewService,
    private userService: UserService,
    private storyService: StoryService
  ) {}

  @Get('featured')
  async getFeaturedStoriesReviews() {
    let reviews: StoryReview[] = []
    let reviewsDetails: StoryReviewDetails[] = []
    let reviewsRatings: StoryReviewsRating[] = []
    const featuredStories = await this.storyService.find({
      featured: true
    })

    for (const featuredStory of featuredStories) {
      const [ratingCount, featuredReview] = await Promise.all([
        this.storyReviewService.getRatingCountByStoryId(featuredStory.id),
        this.storyReviewService.findOneBy({
          storyId: featuredStory.id
        })
      ])

      reviewsRatings = [
        ...reviewsRatings,
        {
          storyId: featuredStory.id,
          ratingCount
        }
      ]

      if (featuredReview === null) {
        continue
      }

      const featuredReviewUser = await this.userService.findOneBy({
        id: featuredReview.userId
      })

      if (featuredReviewUser === null) {
        continue
      }

      reviews = [
        ...reviews,
        {
          ...featuredReview
        }
      ]
      reviewsDetails = [
        ...reviewsDetails,
        {
          storyReviewId: featuredReview.id,
          userName: featuredReviewUser.name,
          storyName: featuredStory.name,
          storySlug: featuredStory.slug
        }
      ]
    }

    return {
      reviews,
      reviewsDetails,
      reviewsRatings
    }
  }

  @Get('library')
  async getLibraryStoriesRatings(@Query() dto: GetLibraryStoriesDto) {
    const libraryStories = await this.storyService.getLibraryStories(dto)
    let reviewsRatings: StoryReviewsRating[] = []

    for (const story of libraryStories.stories) {
      const ratingCount = await this.storyReviewService.getRatingCountByStoryId(story.id)
      reviewsRatings = [
        ...reviewsRatings,
        {
          storyId: story.id,
          ratingCount
        }
      ]
    }

    return reviewsRatings
  }

  @Get('story/:id')
  async getReviewsByStoryId(@Param('id') id: string) {
    let reviewsDetails: StoryReviewDetails[] = []
    const [story, storyReviews] = await Promise.all([
      this.storyService.findOneByOrFail({
        id: Number(id)
      }),
      this.storyReviewService.find({
        storyId: Number(id)
      })
    ])

    for (const storyReview of storyReviews) {
      const user = await this.userService.findOneByOrFail({
        id: storyReview.userId
      })

      reviewsDetails = [
        ...reviewsDetails,
        {
          storyReviewId: storyReview.id,
          userName: user.name,
          storyName: story.name,
          storySlug: story.slug
        }
      ]
    }

    return {
      reviews: storyReviews,
      reviewsDetails,
      ratingCount: this.storyReviewService.getRatingCount(storyReviews)
    }
  }

  @Get(':storyId')
  async getReviewByStoryId(@Param('storyId') storyId: string) {
    const [story, storyReview] = await Promise.all([
      this.storyService.findOneByOrFail({
        id: Number(storyId)
      }),
      this.storyReviewService.findOneByOrFail({
        storyId: Number(storyId)
      })
    ])
    const user = await this.userService.findOneByOrFail({
      id: storyReview.userId
    })
    const details: StoryReviewDetails = {
      storyReviewId: storyReview.id,
      userName: user.name,
      storyName: story.name,
      storySlug: story.slug
    }

    return {
      review: storyReview,
      details
    }
  }

  @Post(':storyId')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('storyId') storyId: string,
    @Body() dto: CreateStoryReviewDto
  ) {
    const storyReview = await this.storyReviewService.findOneBy({
      userId: currentUser.id,
      storyId: Number(storyId)
    })

    if (storyReview !== null) {
      throw new BadRequestException({
        message: 'You have already posted a review on this story'
      })
    }

    await this.storyReviewService.create(dto, currentUser.id, Number(storyId))
    return {
      message: 'Your review have been posted successfully'
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: EditStoryReviewDto
  ) {
    const storyReview = await this.storyReviewService.findOneByOrFail({
      id: Number(id)
    })

    if (storyReview.userId !== currentUser.id) {
      throw new UnauthorizedException({
        message: `You don't have permission to edit this review`
      })
    }
    if (
      storyReview.stars === dto.stars &&
      storyReview.comment === dto.comment
    ) {
      return {
        message: 'Your review have been edited successfully',
      }
    }

    await this.storyReviewService.update({ id: Number(id) }, dto)
    return {
      message: 'Your review have been edited successfully'
    }
  }

  @Delete(':storyId')
  @UseGuards(JwtAuthGuard)
  async deleteReviewByStoryId(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('storyId') id: string
  ) {
    const storyReview = await this.storyReviewService.findOneByOrFail({
      id: Number(id)
    })

    if (storyReview.userId !== currentUser.id) {
      throw new UnauthorizedException({
        message: `You don't have permission to delete this review`
      })
    }

    await this.storyReviewService.delete({
      id: Number(id)
    })
    return {
      message: 'Story review have been deleted successfully'
    }
  }
}
