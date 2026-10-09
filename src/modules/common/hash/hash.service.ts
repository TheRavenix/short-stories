import { Inject, Injectable } from '@nestjs/common'

import { HashStrategy } from './hash.types'

@Injectable()
export class HashService {
  constructor(@Inject('HashStrategy') private strategy: HashStrategy) {}

  hash(data: string) {
    return this.strategy.hash(data)
  }

  compare(data: string, encrypted: string) {
    return this.strategy.compare(data, encrypted)
  }
}
