import { IsEmail, IsOptional, Length } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail(undefined, { message: 'Please provide a valid email address' })
  email: string

  @Length(4, undefined, {
    message: 'Password must be at least 4 characters long'
  })
  password: string
}

export class SignUpDto extends AuthCredentialsDto {
  @IsOptional()
  @Length(2, undefined, {
    message: 'This name is too short'
  })
  name?: string
}

export class SignInDto extends AuthCredentialsDto {}
