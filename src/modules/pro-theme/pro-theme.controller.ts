import { Controller, Get, UseGuards } from '@nestjs/common'

import { ProThemeService } from './pro-theme.service'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { UserProGuard } from 'src/common/guards/user-pro.guard'

@Controller('pro-themes')
export class ProThemeController {
  constructor(private proThemeService: ProThemeService) {}

  @Get()
  @UseGuards(JwtAuthGuard, UserProGuard)
  getAll() {
    return this.proThemeService.readThemes()
  }
}
