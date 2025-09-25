import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email ko để trống' })
  email: string;

  @IsNotEmpty({ message: 'mật khẩu ko để trống' })
  @MinLength(6)
  password: string;

  @IsOptional()
  name: string;
}


export class VerifyAuthDto {
  @IsNotEmpty({ message: 'id ko để trống' })
  _id: string;

  @IsNotEmpty({ message: 'code ko để trống' })
  code: string;
}

export class ChangePasswordAuthDto {

  @IsNotEmpty({ message: 'code ko để trống' })
  code: string;

  @IsNotEmpty({ message: 'password ko để trống' })
  password: string;

  @IsNotEmpty({ message: 'confirmPassword ko để trống' })
  confirmPassword: string;

  @IsNotEmpty({ message: 'email ko để trống' })
  email: string;
}