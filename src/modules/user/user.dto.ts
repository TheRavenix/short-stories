import { IsEmail, IsOptional, Length } from 'class-validator'

import { AuthCredentialsDto } from '../auth/auth.dto'

export class CreateUserDto extends AuthCredentialsDto {
  @IsOptional()
  name?: string
}

export class EditNameDto {
  @Length(2, undefined, {
    message: 'This name is too short'
  })
  name: string
}

export class EditEmailDto {
  @IsEmail(undefined, {
    message: 'Incorrect email address'
  })
  currentEmail: string

  @IsEmail(undefined, {
    message: 'New email must be a valid email address'
  })
  newEmail: string
}

export class ChangePasswordDto {
  @Length(4, undefined, {
    message: 'Incorrect password'
  })
  currentPassword: string

  @Length(4, undefined, {
    message: 'New password must be at least 4 characters long'
  })
  newPassword: string
}
