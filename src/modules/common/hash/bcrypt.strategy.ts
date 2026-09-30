import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { HashStrategy } from './hash.types';

@Injectable()
export class BcryptStrategy implements HashStrategy {
  private saltRounds = 10;

  hash(data: string) {
    return bcrypt.hash(data, this.saltRounds)
  }

  compare(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted)
  }
}
