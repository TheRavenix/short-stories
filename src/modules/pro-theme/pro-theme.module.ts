import { Module } from '@nestjs/common';

import { ProThemeController } from './pro-theme.controller';
import { ProThemeService } from './pro-theme.service';
import { UserModule } from '../user/user.module';
import { UserProGuard } from '../user/guards/user-pro.guard';

@Module({
  imports: [UserModule],
  controllers: [ProThemeController],
  providers: [ProThemeService, UserProGuard]
})
export class ProThemeModule {}
