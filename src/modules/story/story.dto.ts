import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { StoryGenre } from './story.constants';
import { UserPlan } from '../user/user.constants';

export class CreateStoryDto {
  @Length(1, undefined, { message: 'Story name is too short' })
  name: string

  @Length(1, undefined, { message: 'Story description is too short' })
  description: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  about?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preview?: string[]

  @IsEnum(StoryGenre, {
    each: true,
    message: 'Please provide a valid story genre',
  })
  genre: StoryGenre[]

  @IsString({ message: 'Please provide a cover image' })
  coverImage: string

  @IsOptional()
  @IsEnum(UserPlan, { message: 'Invalid plan' })
  plan?: UserPlan

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  content?: string[]

  @IsOptional()
  @IsBoolean()
  featured?: boolean
}

export class EditStoryDto {
  @IsOptional()
  @Length(1, undefined, { message: 'Story name is too short' })
  name: string

  @IsOptional()
  @Length(1, undefined, { message: 'Story description is too short' })
  description: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  about?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preview?: string[]

  @IsOptional()
  @IsEnum(StoryGenre, {
    each: true,
    message: 'Please provide a valid story genre',
  })
  genre: StoryGenre[]

  @IsOptional()
  @IsString({ message: 'Please provide a cover image' })
  coverImage: string

  @IsOptional()
  @IsEnum(UserPlan, { message: 'Invalid plan' })
  plan?: UserPlan

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  content?: string[]
}

export class GetLibraryStoriesDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  skip?: number

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  limit?: number

  @IsOptional()
  @IsString()
  q: string

  @IsOptional()
  plan?: UserPlan | string

  @IsOptional()
  genre?: StoryGenre | string
}
