import { 
  Column,
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  Unique, 
  UpdateDateColumn 
} from 'typeorm'

import { UserPlan } from '../user/user.constants'

@Entity('stories')
@Unique(['name', 'slug'])
export class Story {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'user_id'
  })
  userId: number

  @Column()
  name: string

  @Column()
  slug: string

  @Column()
  description: string

  @Column({
    type: 'text',
    array: true,
    default: []
  })
  content: string[]

  @Column({
    type: 'text',
    array: true,
    default: []
  })
  about: string[]

  @Column({
    type: 'text',
    array: true,
    default: []
  })
  preview: string[]

  @Column({
    type: 'text',
    array: true,
    default: []
  })
  genre: string[]

  // Add default cover image
  @Column({
    name: 'cover_image'
  })
  coverImage: string

  @Column({ 
    default: 0 
  })
  views: number

  @Column({ 
    default: 0 
  })
  downloads: number

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.Free
  })
  plan: UserPlan

  @Column({ 
    default: false 
  })
  featured: boolean

  @Column({
    type: 'numeric',
    default: 0
  })
  rating: number

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt: Date
}
