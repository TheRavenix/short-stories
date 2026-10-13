import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import jsPDF from 'jspdf'
import { Response } from 'express'

import {
  CreateStoryDto,
  EditStoryDto,
  GetLibraryStoriesDto,
} from './story.dto'
import { StoryService } from './story.service'
import { CurrentUserType } from '../user/user.types'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { UserAdminGuard } from 'src/common/guards/user-admin.guard'
import { slugify } from 'src/utils/slugify'

@Controller('stories')
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Get('featured')
  findFeaturedStories() {
    return this.storyService.find({
      where: {
        featured: true
      }
    })
  }

  @Get('library')
  findLibraryStories(@Query() dto: GetLibraryStoriesDto) {
    return this.storyService.findLibraryStories(dto)
  }

  @Get(':slug/id')
  async findStoryIdBySlug(@Param('slug') slug: string) {
    const story = await this.storyService.findStoryIdBySlug(slug)

    if (story === null) {
      throw new NotFoundException({
        message: 'Story not found'
      })
    }

    return story
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
      slug: story.slug,
      message: `Story '${story.name}' have been created successfully`
    }
  }

  @Post('read/:id')
  @UseGuards(JwtAuthGuard)
  async readStory(@Param('id') id: string) {
    const story = await this.storyService.findOneByOrFail({ id: Number(id) })
    await this.storyService.update(
      { 
        id: Number(id)
      },
      {
        views: story.views + 1
      }
    )
  }

  @Post('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadStory(@Param('id') id: string, @Res() res: Response) {
    const story = await this.storyService.findOneByOrFail({
      id: Number(id),
    })
    const doc = new jsPDF()

    doc.text(`Story: ${story.name}`, 10, 10)

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    await this.storyService.update(
      {
        id: Number(id),
      },
      {
        downloads: story.downloads + 1
      }
    )

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment filename=${story.name}.pdf`,
      'Content-Length': pdfBuffer.length
    })
    res.end(pdfBuffer)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserAdminGuard)
  async editStory(@Param('id') id: string, @Body() dto: EditStoryDto) {
    const slug = dto.name !== undefined ? slugify(dto.name) : undefined
    await this.storyService.update(
      {
        id: Number(id),
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
  async deleteStory(@Param('id') id: string) {
    await this.storyService.delete({ 
      id: Number(id) 
    })
    return {
      message: 'Story have been deleted successfully'
    }
  }
}
