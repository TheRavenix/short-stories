import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { 
  ArrayContains,
  FindManyOptions, 
  FindOptionsOrder, 
  FindOptionsWhere, 
  ILike, 
  Repository 
} from 'typeorm'

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

  find(options?: FindManyOptions<Story>) {
    return this.storyRepository.find(options)
  }

  findStoryIdBySlug(slug: string) {
    return this.storyRepository.findOne({
      select: {
        id: true
      },
      where: {
        slug
      }
    })
  }

  async findPaginated(options?: FindManyOptions<Story>) {
    const [stories, count] = await Promise.all([
      this.storyRepository.find(options),
      this.storyRepository.count(options)
    ])
    return {
      stories,
      count
    }
  }

  findLibraryStories(dto: GetLibraryStoriesDto) {
    let plan: UserPlan | undefined = dto.plan
    let genre: StoryGenre | undefined = dto.genre
    let order: string | undefined = dto.order
    let orderOptions: FindOptionsOrder<Story> | undefined

    if (plan !== undefined && (plan === ALL_PLANS as UserPlan)) {
      plan = undefined
    }
    if (genre !== undefined && (genre === ALL_GENRES as StoryGenre)) {
      genre = undefined
    }

    switch (order) {
      case 'most-popular':
        orderOptions = {
          views: 'DESC'
        }
      break

      case 'highest-rated':
        orderOptions = {
          rating: 'DESC'
        }
      break

      case 'newest-first':
        orderOptions = {
          createdAt: 'DESC'
        }
      break

      case 'oldest-first':
        orderOptions = {
          createdAt: 'ASC'
        }
      break
    }

    return this.findPaginated(
      {
        where: {
          name: ILike(`%${dto.q ?? ''}%`),
          plan,
          genre: genre !== undefined ? ArrayContains([genre]) : undefined
        },
        order: orderOptions,
        skip: dto.skip || 0,
        take: dto.limit || PAGINATION_LIMIT
      }
    )
  }

  findOneBy(where: FindOptionsWhere<Story>) {
    return this.storyRepository.findOneBy(where)
  }

  async findOneByOrFail(where: FindOptionsWhere<Story>) {
    const user = await this.storyRepository.findOneBy(where)

    if (user === null) {
      throw new NotFoundException({
        message: 'Story not found'
      })
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

  update(where: FindOptionsWhere<Story>, update: Partial<Story>) {
    return this.storyRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<Story>) {
    return this.storyRepository.delete(where)
  }
}
