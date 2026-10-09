import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ArrayContains, FindOptionsWhere, ILike, Repository } from 'typeorm'

import { Story } from './story.entity'
import { CreateStoryDto, GetLibraryStoriesDto } from './story.dto'
import {
  ALL_GENRES,
  ALL_PLANS,
  PAGINATION_LIMIT,
} from 'src/common/constants/filters.constant'
import { slugify } from 'src/utils/slugify'
import { UserPlan } from '../user/user.constants'
import { StoryGenre } from './story.constants'

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story) private storyRepository: Repository<Story>
  ) {}

  find(where: FindOptionsWhere<Story> = {}) {
    return this.storyRepository.find({ where })
  }

  async getStoryIdBySlug(slug: string) {
    const story = await this.storyRepository.findOne({
      select: {
        id: true
      },
      where: {
        slug
      }
    })

    if (story === null) {
      throw new NotFoundException({
        message: 'Story not found'
      })
    }

    return story
  }

  async findPaginated(
    where: FindOptionsWhere<Story> | FindOptionsWhere<Story>[] = {},
    skip = 0,
    take = PAGINATION_LIMIT
  ) {
    const [stories, count] = await Promise.all([
      this.storyRepository.find({
        where,
        skip,
        take
      }),
      this.storyRepository.count({
        where
      })
    ])
    return {
      stories,
      count
    }
  }

  getLibraryStories(dto: GetLibraryStoriesDto) {
    let plan: UserPlan | undefined
    let genre: StoryGenre | undefined

    if (dto.plan !== undefined && dto.plan.toLowerCase() !== ALL_PLANS) {
      plan = dto.plan.toLowerCase() as UserPlan
    }
    if (dto.genre !== undefined && dto.genre.toLowerCase() !== ALL_GENRES) {
      genre = dto.genre.toLowerCase() as StoryGenre
    }

    return this.findPaginated(
      {
        name: ILike(`%${dto.q ?? ''}%`),
        plan,
        genre: genre !== undefined ? ArrayContains([genre]) : undefined
      },
      dto.skip,
      dto.limit
    )
  }

  findOneBy(where: FindOptionsWhere<Story> = {}) {
    return this.storyRepository.findOneBy(where)
  }

  async findOneByOrFail(where: FindOptionsWhere<Story> = {}) {
    const user = await this.storyRepository.findOneBy(where)

    if (user === null) {
      throw new NotFoundException('Story not found')
    }

    return user
  }

  create(dto: CreateStoryDto, userId: number) {
    const story = this.storyRepository.create({
      userId,
      ...dto,
      slug: slugify(dto.name)
    })
    return this.storyRepository.save(story)
  }

  update(where: FindOptionsWhere<Story> = {}, update: Partial<Story> = {}) {
    return this.storyRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<Story> = {}) {
    return this.storyRepository.delete(where)
  }
}
