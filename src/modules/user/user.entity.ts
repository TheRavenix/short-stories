import {
  Column,
  CreateDateColumn,
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm'
import { Exclude } from 'class-transformer'

import { UserPlan, UserRole } from './user.constants'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ 
    nullable: true 
  })
  name: string

  @Column({ 
    unique: true 
  })
  email: string

  @Exclude({ 
    toPlainOnly: true 
  })
  @Column({ 
    select: false 
  })
  password: string

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.Free,
  })
  plan: UserPlan

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt: Date
}
