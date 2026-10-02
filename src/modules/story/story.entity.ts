import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { UserPlan } from '../user/user.constants';

@Entity('stories')
@Unique(['name', 'slug'])
export class Story {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column()
  name: string

  @Column()
  slug: string

  @Column()
  description: string

  @Column('text', {
    array: true,
    default: []
  })
  content: string[]

  @Column('text',{
    array: true,
    default: []
  })
  about: string[]

  @Column('text', {
    array: true,
    default: []
  })
  preview: string[]

  @Column('text', {
    array: true,
    default: []
  })
  genre: string[]

  // Add default cover image
  @Column()
  coverImage: string

  @Column({ default: 0 })
  views: number

  @Column({ default: 0 })
  downloads: number

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.Free
  })
  plan: UserPlan

  @Column({ default: false })
  featured: boolean
}
