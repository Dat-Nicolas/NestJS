import { Prop } from '@nestjs/mongoose';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  @Prop({unique:true, index:true})
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  image?: string;
}
