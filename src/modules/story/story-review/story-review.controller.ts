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
} from '@nestjs/common';

import { StoryReviewService } from './story-review.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../user/decorators/current-user.decorator';
import { CurrentUserType } from '../../user/user.types';
import { CreateStoryReviewDto, EditStoryReviewDto } from './story-review.dto';
import { UserService } from '../../user/user.service';
import { StoryService } from '../story.service';
import { StoryReviewDetails } from './story-review.types';
import { StoryReview } from './story-review.entity';
import { StoryRating } from '../story.types';
import { GetLibraryStoriesDto } from '../story.dto';

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
    let ratings: StoryRating[] = []
    const featuredStories = await this.storyService.find({
      featured: true
    })

    for (const featuredStory of featuredStories) {
      const [ratingCount, featuredReview] = await Promise.all([
        this.storyReviewService.getStoryRatingCount(featuredStory.id),
        this.storyReviewService.findOneBy({
          storyId: featuredStory.id
        })
      ])

      ratings = [
        ...ratings,
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
          ...featuredReview,

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
      ratings
    }
  }

  @Get('library')
  async getLibraryStoriesRatings(@Query() dto: GetLibraryStoriesDto) {
    const libraryStories = await this.storyService.getLibraryStories(dto)
    let ratings: StoryRating[] = []

    for (const story of libraryStories.stories) {
      const ratingCount = await this.storyReviewService.getStoryRatingCount(story.id)
      ratings = [
        ...ratings,
        {
          storyId: story.id,
          ratingCount
        }
      ]
    }

    return ratings
  }

  @Get('story/:id')
  async getReviewsByStoryId(@Param('id') id: string) {
    let details: StoryReviewDetails[] = []
    const [story, storyReviews] = await Promise.all([
      this.storyService.findOneByOrFail({
        id: parseInt(id)
      }),
      this.storyReviewService.find({
        storyId: parseInt(id)
      })
    ])

    for (const storyReview of storyReviews) {
      const user = await this.userService.findOneByOrFail({
        id: storyReview.userId
      })

      details = [
        ...details,
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
      details
    }
  }

  @Get(':storyId')
  async getReviewByStoryId(@Param('storyId') storyId: string) {
    const [story, storyReview] = await Promise.all([
      this.storyService.findOneByOrFail({
        id: parseInt(storyId)
      }),
      this.storyReviewService.findOneByOrFail({
        storyId: parseInt(storyId)
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
      storyId: parseInt(storyId)
    })

    if (storyReview !== null) {
      throw new BadRequestException({
        message: 'You have already posted a review on this story'
      })
    }

    await this.storyReviewService.create(dto, currentUser.id, parseInt(storyId))
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
      id: parseInt(id)
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

    await this.storyReviewService.update({ id: parseInt(id) }, dto)
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
      id: parseInt(id)
    })

    if (storyReview.userId !== currentUser.id) {
      throw new UnauthorizedException({
        message: `You don't have permission to delete this review`
      })
    }

    await this.storyReviewService.delete({
      id: parseInt(id)
    })
    return {
      message: 'Story review have been deleted successfully'
    }
  }
}
