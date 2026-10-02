import { Controller, Get, UseGuards } from '@nestjs/common';

import { ProFontService } from './pro-font.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserProGuard } from 'src/common/guards/user-pro.guard';

@Controller('pro-fonts')
export class ProFontController {
  constructor(private proFontService: ProFontService) {}

  @Get()
  @UseGuards(JwtAuthGuard, UserProGuard)
  getAll() {
    return this.proFontService.readFonts()
  }
}
