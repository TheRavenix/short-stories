import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm'

import { User } from './user.entity'
import { CreateUserDto } from './user.dto'
import { HashService } from '../common/hash/hash.service'
import { capitalize } from 'src/utils/capitalize'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private hashService: HashService
  ) {}

  findOneBy(where: FindOptionsWhere<User> = {}) {
    return this.userRepository.findOneBy(where)
  }

  findOneWithPassword(
    where: FindOptionsWhere<User> = {},
    select: FindOptionsSelect<User> = {}
  ) {
    return this.userRepository.findOne({
      where,
      select: {
        ...select,
        password: true
      }
    })
  }

  async findOneByOrFail(where: FindOptionsWhere<User> = {}) {
    const user = await this.userRepository.findOneBy(where)

    if (user === null) {
      throw new NotFoundException({
        message: 'User not found'
      })
    }

    return user
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepository.create({
      name: dto.name || this.generateUserName(dto.email),
      email: dto.email.toLowerCase(),
      password: await this.hashService.hash(dto.password)
    })
    return this.userRepository.save(user)
  }

  update(where: FindOptionsWhere<User>, update: Partial<User> = {}) {
    return this.userRepository.update(where, update)
  }

  delete(where: FindOptionsWhere<User>) {
    return this.userRepository.delete(where)
  }

  private generateUserName(email: string) {
    return capitalize(email.split('@')[0]) || 'Reader'
  }
}
