import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  username: string; 

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
