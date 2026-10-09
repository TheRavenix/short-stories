import { BadRequestException, Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'

@Injectable()
export class ProThemeService {
  readThemes(): Record<string, Record<string, string>> {
    try {
      const data = JSON.parse(
        readFileSync(join(__dirname, 'pro-theme-data.json'), 'utf-8')
      )
      return data
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to fetch themes'
      })
    }
  }
}
