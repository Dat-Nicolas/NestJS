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
