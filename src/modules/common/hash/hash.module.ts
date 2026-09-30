import { Module } from '@nestjs/common';

import { HashService } from './hash.service';
import { BcryptStrategy } from './bcrypt.strategy';

@Module({
  providers: [
    {
      provide: 'HashStrategy',
      useClass: BcryptStrategy,
    },
    HashService,
  ],
  exports: [HashService]
})
export class HashModule {}
