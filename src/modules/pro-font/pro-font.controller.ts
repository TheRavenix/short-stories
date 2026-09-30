import { Controller, Get, UseGuards } from '@nestjs/common';

import { ProFontService } from './pro-font.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserProGuard } from '../user/guards/user-pro.guard';

@Controller('pro-fonts')
export class ProFontController {
  constructor(private readonly proFontService: ProFontService) {}

  @Get()
  @UseGuards(JwtAuthGuard, UserProGuard)
  getAll() {
    return this.proFontService.readFonts()
  }
}
