import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helper/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  ChangePasswordAuthDto,
  VerifyAuthDto,
} from '@/auth/dto/create-auth.dto';
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  private async isEmailExist(email: string): Promise<boolean> {
    const exists = await this.userModel.exists({ email });
    return !!exists;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    if (await this.isEmailExist(email)) {
      throw new BadRequestException(
        `Email ${email} đã tồn tại, vui lòng nhập email khác`,
      );
    }

    const hashedPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      image,
    });

    return { _id: user._id.toString() };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-email')
      .sort(sort as any);
    return { results, meta :{
      current:current,
      pageSize:pageSize,
      pages:totalPages,
      totol:totalItems
    } };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('id không hợp lệ');
    }
  }

  async handleRegister(registerDto: CreateUserDto) {
    const { name, email, password } = registerDto;

    if (await this.isEmailExist(email)) {
      throw new BadRequestException(
        `Email ${email} đã tồn tại, vui lòng nhập email khác`,
      );
    }

    const hashedPassword = await hashPasswordHelper(password);
    const codeID = randomUUID();
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      isActive: false,
      codeId: codeID,
      codeExpired: dayjs().add(1, 'days').toDate(),
    });

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account',
      template: 'register',
      context: {
        name: user.name || user.email,
        activationCode: codeID,
      },
    });
    return {
      _id: user._id,
    };
  }

  async handleActive(data: VerifyAuthDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });
    await user.updateOne({
      isActive: true,
    });
    if (!user)
      throw new BadRequestException('mã code không hợp lệ hoặc hết hạn');
    return data;
  }

  async ReVerify(email: string) {
    if (!email) throw new BadRequestException('Thiếu email');

    const user = await this.userModel
      .findOne({ email })
      .select('_id email name isActive');
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }

    const codeID = randomUUID();
    const expiredAt = dayjs().add(1, 'day').toDate();

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { codeId: codeID, codeExpired: expiredAt } },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account',
      template: 'register',
      context: {
        name: user.name || user.email,
        activationCode: codeID,
      },
    });

    return { _id: user._id.toString() };
  }

  async RePassword(email: string) {
    if (!email) throw new BadRequestException('Thiếu email');

    const user = await this.userModel
      .findOne({ email: email })
      .select('_id email name isActive');
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    const codeID = randomUUID();
    const expiredAt = dayjs().add(1, 'day').toDate();

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { codeId: codeID, codeExpired: expiredAt } },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Change your password account',
      template: 'register',
      context: {
        name: user.name || user.email,
        activationCode: codeID,
      },
    });

    return { _id: user._id.toString(), email: user.email };
  }

  async ChangePassword(data: ChangePasswordAuthDto) {
  const { email, code, password, confirmPassword } = data;

  if (!email || !code) {
    throw new BadRequestException('Thiếu email hoặc mã code');
  }
  if (password !== confirmPassword) {
    throw new BadRequestException('Mật khẩu và xác nhận mật khẩu không khớp');
  }

  const now = new Date();
  const user = await this.userModel.findOne({
    email,
    codeId: code,                
    codeExpired: { $gt: now },  
  }).select('_id');

  if (!user) {
    throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn'); 
  }

  const newHashed = await hashPasswordHelper(password);
  await this.userModel.updateOne(
    { _id: user._id },
    { $set: { password: newHashed }, $unset: { codeId: 1, codeExpired: 1 } } 
  );

  return { status: 1, message: 'Đổi mật khẩu thành công' };
}

}
