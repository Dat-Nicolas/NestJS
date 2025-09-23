// src/modules/auth/auth.controller.ts
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  login(@Body() dto: LoginAuthDto) {
    return this.authService.signIn(dto.username, dto.password);
  }

  // @Post('register')
  // @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  // register(@Body() dto: RegisterAuthDto) {
  //   return this.authService.register(dto.email, dto.password, dto.fullName);
  // }
}
