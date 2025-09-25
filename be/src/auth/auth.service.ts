import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper, hashPasswordHelper } from '@/helper/util';
import { JwtService } from '@nestjs/jwt';
import { register } from 'module';
import {
  ChangePasswordAuthDto,
  CreateAuthDto,
  VerifyAuthDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByEmail(username);
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!user || !isValidPassword) return null;
    return user;
  }

  async login(user: any) {
    const payload = {
      username: user.email,
      sub: user._id,
      avatar: user.image,
      roles: user.role,
    };
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };
  Verify = async (data: VerifyAuthDto) => {
    return await this.usersService.handleActive(data);
  };
  ReVerify = async (data: string) => {
    return await this.usersService.ReVerify(data);
  };
  RePassword = async (data: string) => {
    return await this.usersService.RePassword(data);
  };
  ChangePassword = async (data: ChangePasswordAuthDto) => {
    return await this.usersService.ChangePassword(data);
  };
}
