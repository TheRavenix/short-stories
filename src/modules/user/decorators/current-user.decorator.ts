import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((data, context) => {
  const request: Request = context.switchToHttp().getRequest()
  return request.user
})
