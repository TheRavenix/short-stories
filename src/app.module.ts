import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProThemeModule } from './modules/pro-theme/pro-theme.module'
import { ProFontModule } from './modules/pro-font/pro-font.module'
import { StoryModule } from './modules/story/story.module'
import { StoryReviewModule } from './modules/story/story-review/story-review.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: false,
        invalidWhereValuesBehavior: {
          undefined: 'ignore'
        }
      })
    }),
    UserModule,
    AuthModule,
    ProThemeModule,
    ProFontModule,
    StoryModule,
    StoryReviewModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
