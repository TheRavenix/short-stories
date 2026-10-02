import { Module } from '@nestjs/common';

import { ProThemeController } from './pro-theme.controller';
import { ProThemeService } from './pro-theme.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ProThemeController],
  providers: [ProThemeService]
})
export class ProThemeModule {}
