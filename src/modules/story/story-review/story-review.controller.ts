import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { UserRole } from '../../user/user.constants';
import { StoryReviewDetails } from './story-review.types';

@Controller('story-reviews')
export class StoryReviewController {
  constructor(
    private storyReviewService: StoryReviewService,
    private userService: UserService,
    private storyService: StoryService
  ) {}

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

  @Get(':id')
  async getStoryReviewById(@Param('id') id: string) {
    const [story, storyReview] = await Promise.all([
      this.storyService.findOneByOrFail({
        id: parseInt(id)
      }),
      this.storyReviewService.findOneByOrFail({
        storyId: parseInt(id)
      })
    ])
    const user = await this.userService.findOneByOrFail({
      id: storyReview.userId
    })
    const details: StoryReviewDetails = {
      storyReviewId: storyReview?.id,
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
  async createStoryReview(
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
  async editStoryReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: EditStoryReviewDto,
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteStoryReview(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
  ) {
    const [user, storyReview] = await Promise.all([
      this.userService.findOneByOrFail({ id: currentUser.id }),
      this.storyReviewService.findOneByOrFail({ id: parseInt(id) })
    ])

    if (user.role !== UserRole.Admin && storyReview.userId !== currentUser.id) {
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
