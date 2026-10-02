import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ChangePasswordDto, EditEmailDto, EditNameDto } from './user.dto';
import { HashService } from '../common/hash/hash.service';
import { CurrentUserType } from './user.types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private hashService: HashService
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() currentUser: CurrentUserType) {
    return this.userService.findOneByOrFail({
      id: currentUser.id
    })
  }

  // Is this still needed?
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() currentUser: CurrentUserType) {
    const user = await this.userService.findOneByOrFail({
      id: currentUser.id
    })
    return {
      plan: user.plan,
      role: user.role
    }
  }

  @Patch('edit-name')
  @UseGuards(JwtAuthGuard)
  async editName(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: EditNameDto,
  ) {
    const user = await this.userService.findOneByOrFail({
      id: currentUser.id
    })

    if (user.name === dto.name) {
      return {
        message: 'This is already your current name'
      }
    }

    await this.userService.update(
      {
        id: currentUser.id
      },
      {
        name: dto.name
      }
    )
    return {
      message: 'Your name have been edited successfully'
    }
  }

  @Patch('edit-email')
  @UseGuards(JwtAuthGuard)
  async editEmail(
    @Body() dto: EditEmailDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const user = await this.userService.findOneByOrFail({
      id: currentUser.id
    })

    if (user.email !== dto.currentEmail) {
      throw new BadRequestException({
        message: 'Incorrect email address'
      })
    }
    if (user.email === dto.newEmail) {
      throw new BadRequestException({
        message: 'New email must be different from current email'
      })
    }

    const userWithEmail = await this.userService.findOneBy({
      email: dto.newEmail,
    })

    if (userWithEmail !== null) {
      throw new ConflictException({
        message: 'This email is already linked with another account'
      })
    }

    await this.userService.update(
      {
        id: currentUser.id
      },
      {
        email: dto.newEmail
      }
    )
    return {
      message: 'Your email have been edited successfully'
    }
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    const user = await this.userService.findOneByOrFail({
      id: currentUser.id
    })

    if (!(await this.hashService.compare(dto.currentPassword, user.password))) {
      throw new BadRequestException({
        message: 'Incorrect password'
      })
    }
    if (await this.hashService.compare(dto.newPassword, user.password)) {
      throw new BadRequestException({
        message: 'New password must be different from current password'
      })
    }

    await this.userService.update(
      {
        id: currentUser.id
      },
      {
        password: await this.hashService.hash(dto.newPassword)
      }
    )
    return {
      message: 'Your password have been changed successfully'
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    if (parseInt(id) !== currentUser.id) {
      throw new UnauthorizedException({
        message: 'You are not allowed to delete this account'
      })
    }

    await this.userService.delete({
      id: currentUser.id,
    })
    return {
      message: 'Your account have been deleted successfully'
    }
  }
}
