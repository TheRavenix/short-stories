import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStoryContentDto {
  @IsNumber()
  storyId: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  content?: string[]
}
