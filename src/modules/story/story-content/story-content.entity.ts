import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('story_contents')
export class StoryContent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  storyId: number

  @Column('text', { array: true, default: [] })
  content: string[]
}
