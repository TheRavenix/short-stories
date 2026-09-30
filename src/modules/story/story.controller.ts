import {
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
import { ILike } from 'typeorm';

import {
  CreateStoryDto,
  EditStoryDto,
  GetLibraryStoriesDto,
} from './story.dto';
import { StoryService } from './story.service';
import { CurrentUserType } from '../user/user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MarkForDeletion } from 'src/common/decorators/mark-for-deletion.decorator';
import { MarkForDeletionReason } from 'src/common/constants/mark-for-deletion-reason.constant';
import { StoryGenre } from './story.constants';
import { UserAdminGuard } from '../user/guards/user-admin.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { UserPlan } from '../user/user.constants';
import { StoryContentService } from './story-content/story-content.service';
import { StoryReviewService } from './story-review/story-review.service';
import { UserService } from '../user/user.service';
import { capitalize } from 'src/utils/capitalize';
import { slugify } from 'src/utils/slugify';
import { Story } from './story.entity';
import { StoryReview } from './story-review/story-review.entity';
import { StoryRating } from './story.types';
import { StoryReviewDetails } from './story-review/story-review.types';

@Controller('stories')
export class StoryController {
  constructor(
    private storyService: StoryService,
    private storyContentService: StoryContentService,
    private storyReviewService: StoryReviewService,
    private userService: UserService
  ) {}

  @Get('featured')
  async getFeaturedStories() {
    let stories: Story[] = []
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

      stories = [
        ...stories,
        featuredStory
      ]
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
      stories,
      reviews,
      reviewsDetails
    }
  }

  @Get('library')
  async getLibraryStories(@Query() dto: GetLibraryStoriesDto) {
    const libraryStories = await this.storyService.findPaginated(
      {
        name: ILike(`%${dto.q ?? ''}%`),
        ...this.storyService.buildLibraryStoriesFilters(dto),
      },
      dto.skip,
      dto.limit
    )
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

    return {
      stories: libraryStories.stories,
      storiesCount: libraryStories.count,
      ratings
    }
  }

  @Get(':slug/id')
  getStoryIdBySlug(@Param('slug') slug: string) {
    return this.storyService.getStoryIdBySlug(slug)
  }

  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const story = await this.storyService.findOneByOrFail({ slug })
    const ratingCount = await this.storyReviewService.getStoryRatingCount(story.id)
    return {
      story,
      ratingCount
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async createStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryDto,
  ) {
    const story = await this.storyService.create(dto, currentUser.id)
    await this.storyContentService.create({
      storyId: story.id,
      content: dto.content
    })
    return {
      message: `Story '${story.name}' have been created successfully`
    }
  }

  @Post('read/:id')
  @UseGuards(JwtAuthGuard)
  async readStory(@Param('id') id: string) {
    const story = await this.storyService.findOneByOrFail({ id: parseInt(id) })
    await this.storyService.update(
      { id: parseInt(id) },
      {
        views: story.views + 1
      }
    )
  }

  /* @Post('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadStory(@Param('id') id: string, @Res() res: Response) {
    const story = await this.storyService.findOneBy({ id: parseInt(id) });

    const doc = new jsPDF();

    doc.text(`Story: ${story.name}`, 10, 10);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    await this.storyService.update(
      {
        id: parseInt(id),
      },
      {
        downloads: story.downloads + 1,
      },
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${story.name}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } */

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async editStory(@Param('id') id: string, @Body() dto: EditStoryDto) {
    const story = await this.storyService.findOneByOrFail({
      id: parseInt(id)
    })
    const storyContent = await this.storyContentService.findOneByOrFail({
      storyId: story.id
    })

    const slug = slugify(dto.name)
    await Promise.all([
      this.storyService.update(
        { 
          id: parseInt(id)
        },
        {
          ...dto,
          slug
        }
      ),
      this.storyContentService.update(
        {
          id: storyContent.id
        },
        {
          content: dto.content
        }
      )
    ]);

    return {
      message: 'Story have been edited successfully',
      slug
    }
  }

  @Post('fake-stories')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  @MarkForDeletion(MarkForDeletionReason.Testing)
  createFakeStories(@CurrentUser() currentUser: CurrentUserType) {
    const chars = 'azertyuiopqsdfghjklmwxcvbn123456789'

    const getRandomName = () => {
      let name = ''
      for (let i = 0; i < 5; i++) {
        name += chars[Math.floor(Math.random() * chars.length)]
      }
      return name
    }

    const content: string[] = []
    for (let i = 0; i < 100; i++) {
      content.push('Hello world! '.repeat(10))
    }
    for (let i = 0; i < 25; i++) {
      const storyName = `${capitalize(getRandomName())} ${capitalize(getRandomName())}`
      this.createStory(currentUser, {
        name: storyName,
        description: `Story description ${i + 1}`,
        coverImage: 'short-story-cover.jpeg',
        genre:
          Math.random() > 0.5 ? [StoryGenre.Adventure] : [StoryGenre.Mystery],
        plan: UserPlan.Free,
        content: [`Hello ${storyName} `.repeat(10), ...content]
      })
      console.log(`Story ${i} done`)
    }
    return { message: 'done' }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async deleteStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Param('id') id: string,
  ) {
    const story = await this.storyService.findOneByOrFail({
      id: parseInt(id),
      userId: currentUser.id
    })

    if (story.userId !== parseInt(id)) {
      throw new UnauthorizedException({
        message: 'You do not have permission to delete this story'
      })
    }

    await Promise.all([
      this.storyService.delete({ id: parseInt(id) }),
      this.storyContentService.delete({ storyId: parseInt(id) }),
      this.storyReviewService.delete({ storyId: parseInt(id) })
    ])
    return {
      message: 'Story have been deleted successfully'
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  @MarkForDeletion(MarkForDeletionReason.Testing)
  async deleteAll() {
    await Promise.all([
      this.storyService.delete(),
      this.storyContentService.delete(),
      this.storyReviewService.delete()
    ])
    return { message: 'done' }
  }
}
