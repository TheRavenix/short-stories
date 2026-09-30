import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { HashModule } from '../common/hash/hash.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HashModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
