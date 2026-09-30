import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { SignInDto, SignUpDto } from './auth.dto';
import { UserService } from '../user/user.service';
import { HashService } from '../common/hash/hash.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private hashService: HashService
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.findOneBy({
      email: dto.email.toLowerCase()
    })

    if (user !== null) {
      throw new UnauthorizedException({
        message: 'This email is already linked with another account'
      })
    }

    const createdUser = await this.userService.create(dto)
    const authToken = await this.authService.generateAuthToken(
      createdUser.id.toString()
    )
    res.cookie('token', authToken, this.authService.getTokenCookieOptions())
    res.json({ message: `Welcome ${createdUser.name}` })
  }

  @Post('sign-in')
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.findOneWithPassword(
      {
        email: dto.email.toLowerCase(),
      },
      {
        id: true,
        name: true
      }
    )

    if (
      user === null ||
      !(await this.hashService.compare(dto.password, user.password))
    ) {
      throw new UnauthorizedException({
        message: 'Invalid credentials'
      })
    }

    const authToken = await this.authService.generateAuthToken(
      user.id.toString()
    )
    res.cookie('token', authToken, this.authService.getTokenCookieOptions())
    res.json({ message: `Welcome Back ${user.name}` })
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token')
    res.json({ message: 'Signed out successfully' })
  }
}
