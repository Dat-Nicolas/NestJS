// src/modules/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe , Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
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
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto:CreateAuthDto) {
    return  this.authService.handleRegister(registerDto)
  }

  @Get('mail')
  @Public()
  testmail() {
    this.mailerService
      .sendMail({
        to: 'topchit031@gmail.com', // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b> xin chào topchit</b>', // HTML body content
      })
    return  "ok"
  }


  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }

 
}
