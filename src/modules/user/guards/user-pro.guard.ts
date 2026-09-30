import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUserType } from 'src/modules/user/user.types';
import { UserPlan } from '../user.constants';

@Injectable()
export class UserProGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (request.user === undefined) {
      return false;
    }

    const currentUser = request.user as CurrentUserType;

    const user = await this.userService.findOneBy({
      id: currentUser.id,
    });

    if (user === null || user.plan !== UserPlan.Pro) {
      return false;
    }

    return true;
  }
}
