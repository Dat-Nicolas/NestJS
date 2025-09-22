import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper, hashPasswordHelper } from '@/helper/util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException(`Username  ${username}  / password ${pass} không hợp lệ`);
    }

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException(`password ${pass} ${user.password} không hợp lệ`);
    }

    const payload = {
      sub: String(user._id),
      username: user.email,
      role: user.role ?? 'user',
    };

    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token
    }
    // return {
    //   status: 1,
    //   message: 'Đăng nhập thành công',
    //   data: {
    //     access_token,
    //     user: {
    //       id: String(user._id),
    //       email: user.email,
    //       name: user.name ?? '',
    //       role: user.role ?? 'user',
    //       image: user.image ?? null,
    //       phone: user.phone ?? '',
    //       address: user.address ?? '',
    //       accountType: user.accountType ?? 'local',
    //       isActive: user.isActive ?? false,
    //     },
    //   },
    // };
  }
// async register(email: string, password: string, fullName: string) {
//   const existed = await this.usersService.findByEmail(email);
//   if (existed) throw new ConflictException('Email đã tồn tại');

//   const hashed = await hashPasswordHelper(password);
//   await this.usersService.create({ email, password: hashed, name: fullName });

//   const created = await this.usersService.create({
//     email,
//     password: hashed,
//     name: fullName,   
//   });

//   if (!created) throw new NotFoundException('Tạo tài khoản thất bại');

//   const payload = {
//     sub: String(created._id),
//     username: created.email,
//     role: created.role ?? 'user',
//   };

//   const access_token = await this.jwtService.signAsync(payload);

//   return {
//     status: 1,
//     message: 'Đăng ký thành công',
//     data: {
//       access_token,
//       user: {
//         id: String(created._id),
//         email: created.email,
//         name: created.name ?? '',
//         role: created.role ?? 'user',
//         image: created.image ?? null,
//         phone: created.phone ?? '',
//         address: created.address ?? '',
//         accountType: created.accountType ?? 'local',
//         isActive: created.isActive ?? false,
//       },
//     },
//   };
// }

}
