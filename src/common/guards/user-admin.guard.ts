import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable 
} from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUserType } from 'src/modules/user/user.types';
import { UserRole } from 'src/modules/user/user.constants';

@Injectable()
export class UserAdminGuard implements CanActivate {
  constructor(@Inject(UserService) private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true
    // const request: Request = context.switchToHttp().getRequest()

    // if (request.user === undefined) {
    //   return false
    // }

    // const currentUser = request.user as CurrentUserType
    // const user = await this.userService.findOneBy({
    //   id: currentUser.id
    // })

    // if (user === null || user.role !== UserRole.Admin) {
    //   return false
    // }

    // return true
  }
}
