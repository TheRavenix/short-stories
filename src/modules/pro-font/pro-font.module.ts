import { Module } from '@nestjs/common'

import { ProFontController } from './pro-font.controller'
import { ProFontService } from './pro-font.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [UserModule],
  controllers: [ProFontController],
  providers: [ProFontService]
})
export class ProFontModule {}
