import { 
  Column,
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm'

@Entity('story_reviews')
export class StoryReview {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'user_id'
  })
  userId: number

  @Column({
    name: 'story_id'
  })
  storyId: number

  @Column()
  stars: number

  @Column()
  comment: string

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt: Date
}
