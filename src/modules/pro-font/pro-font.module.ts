import { Module } from '@nestjs/common';

import { ProFontController } from './pro-font.controller';
import { ProFontService } from './pro-font.service';
import { UserModule } from '../user/user.module';
import { UserProGuard } from '../user/guards/user-pro.guard';

@Module({
  imports: [UserModule],
  controllers: [ProFontController],
  providers: [ProFontService, UserProGuard]
})
export class ProFontModule {}
