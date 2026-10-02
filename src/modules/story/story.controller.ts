import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import jsPDF from 'jspdf';
import { Response } from 'express';

import {
  CreateStoryDto,
  EditStoryDto,
  GetLibraryStoriesDto,
} from './story.dto';
import { StoryService } from './story.service';
import { CurrentUserType } from '../user/user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { UserAdminGuard } from 'src/common/guards/user-admin.guard';
import { slugify } from 'src/utils/slugify';

@Controller('stories')
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Get('featured')
  getFeaturedStories() {
    return this.storyService.find({ featured: true })
  }

  @Get('library')
  getLibraryStories(@Query() dto: GetLibraryStoriesDto) {
    return this.storyService.getLibraryStories(dto)
  }

  @Get(':slug/id')
  getStoryIdBySlug(@Param('slug') slug: string) {
    return this.storyService.getStoryIdBySlug(slug)
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.storyService.findOneByOrFail({ slug })
  }

  @Post()
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async createStory(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: CreateStoryDto
  ) {
    const story = await this.storyService.create(dto, currentUser.id)
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

  @Post('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadStory(@Param('id') id: string, @Res() res: Response) {
    const story = await this.storyService.findOneByOrFail({
      id: parseInt(id)
    })
    const doc = new jsPDF()

    doc.text(`Story: ${story.name}`, 10, 10)

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    await this.storyService.update(
      {
        id: parseInt(id),
      },
      {
        downloads: story.downloads + 1
      }
    )

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${story.name}.pdf`,
      'Content-Length': pdfBuffer.length
    })
    res.end(pdfBuffer)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async editStory(@Param('id') id: string, @Body() dto: EditStoryDto) {
    const slug = slugify(dto.name)
    await this.storyService.update(
      { 
        id: parseInt(id)
      },
      {
        ...dto,
        slug
      }
    )
    return {
      message: 'Story have been edited successfully',
      slug
    }
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

    await this.storyService.delete({ id: parseInt(id) })
    return {
      message: 'Story have been deleted successfully'
    }
  }
}
