import {
  IsNumber,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator'

export class CreateStoryReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number

  @Length(1, undefined, {
    message: 'Story review comment cannot be empty'
  })
  comment: string
}

export class EditStoryReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  stars?: number

  @IsOptional()
  @Length(1, undefined, {
    message: 'Story review comment cannot be empty'
  })
  comment?: string
}
