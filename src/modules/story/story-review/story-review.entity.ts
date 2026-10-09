import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('story_reviews')
export class StoryReview {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  storyId: number

  @Column()
  stars: number

  @Column()
  comment: string
}
