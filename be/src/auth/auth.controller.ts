// src/modules/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe , Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { CreateAuthDto, VerifyAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Đăng nhập thành công")
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  @ResponseMessage("Đăng ký thành công")
  register(@Body() registerDto:CreateAuthDto) {
    return  this.authService.handleRegister(registerDto)
  }


  @Post('verify')
  @Public()
  @ResponseMessage("Xác thực thành công")
  Verify(@Body() registerDto:VerifyAuthDto) {
    return  this.authService.Verify(registerDto)
  }

  @Post('re-verify')
  @Public()
  @ResponseMessage("Gửi lại mã xác thực thành công")
  ReVerify(@Body("email") email:string) {
    return  this.authService.ReVerify(email)
  }

  @Get('profile')
  @ResponseMessage("Lấy thông tin người dùng thành công")
  getProfile(@Request() req) {
    return req.user;
  }

 
}
