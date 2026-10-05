import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, type ValidationError } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors.map(
          (error) => Object.values(error.constraints || {})[0]
        )[0]
        return new BadRequestException(message)
      }
    })
  )
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
  await app.listen(4000)
}
bootstrap()
