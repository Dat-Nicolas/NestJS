import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helper/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private async isEmailExist(email: string): Promise<boolean> {
    const exists = await this.userModel.exists({ email });
    return !!exists;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    if (await this.isEmailExist(email)) {
      throw new BadRequestException(`Email ${email} đã tồn tại, vui lòng nhập email khác`);
    }

    const hashedPassword = await  hashPasswordHelper(password); 
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
  

  async findAll(query:string , current : number , pageSize : number) {
    
    const {filter , sort} =aqp(query)

    if(filter.current) delete filter.current;
    if(filter.pageSize) delete filter.pageSize;

    if (!current) current =1;
    if (!pageSize) pageSize =10;
    const totalItems = ((await this.userModel.find(filter)).length)
    const totalPages = Math.ceil(totalItems/pageSize)
    const skip = (current-1) *pageSize;
    const results = await this.userModel
    .find(filter)
    .limit(pageSize)
    .skip(skip)
    .select("-email")
    .sort(sort as any)
    return {results , totalPages} ;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email:string) {
    return await this.userModel.findOne({email})
  }

  async update( updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({_id :updateUserDto._id},{...updateUserDto});
  }

  async remove(_id: string) {
    if(mongoose.isValidObjectId(_id)) {
       return this.userModel.deleteOne({_id})
    } else {
      throw new BadRequestException("id không hợp lệ")
    }
  }
}







// import { BadRequestException, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import mongoose from 'mongoose';
// import aqp from 'api-query-params';

// import { User, UserDocument } from './schemas/user.schema';

// type SafeUser = Omit<User, 'password'> & { _id: any };

// @Injectable()
// export class UsersService {
//   constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

//   // ---------- Auth dùng ----------
//   async findByEmail(email: string): Promise<UserDocument | null> {
//     return this.userModel.findOne({ email }).exec();
//   }

//   // Cho phép truyền Partial<User> để linh hoạt (Auth.register đang dùng)
//   async create(data: Partial<User>): Promise<UserDocument> {
//     const created = new this.userModel(data);
//     return created.save();
//   }

//   async findById(id: string): Promise<UserDocument | null> {
//     if (!mongoose.isValidObjectId(id)) return null;
//     return this.userModel.findById(id).exec();
//   }

//   async updateById(id: string, update: Partial<User>): Promise<UserDocument | null> {
//     if (!mongoose.isValidObjectId(id)) {
//       throw new BadRequestException('id không hợp lệ');
//     }
//     // Không cho update các field hệ thống nhạy cảm
//     delete (update as any)?.password;
//     delete (update as any)?._id;

//     return this.userModel
//       .findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
//       .exec();
//   }

//   // ---------- Các hàm controller đang gọi ----------

//   /**
//    * GET /users?current=1&pageSize=10&... (aqp filter, sort)
//    * Trả về { results, totalPages, totalItems, current, pageSize }
//    */
//   async findAll(
//     query: string,
//     current?: number,
//     pageSize?: number,
//   ): Promise<{
//     results: SafeUser[];
//     totalPages: number;
//     totalItems: number;
//     current: number;
//     pageSize: number;
//   }> {
//     const { filter, sort } = aqp(query || '');

//     // loại bỏ tham số phân trang khỏi filter
//     if ((filter as any).current) delete (filter as any).current;
//     if ((filter as any).pageSize) delete (filter as any).pageSize;

//     const _current = Number(current) > 0 ? Number(current) : 1;
//     const _pageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;

//     const totalItems = await this.userModel.countDocuments(filter as any).exec();
//     const totalPages = Math.ceil(totalItems / _pageSize) || 1;
//     const skip = (_current - 1) * _pageSize;

//     const results = await this.userModel
//       .find(filter as any)
//       .limit(_pageSize)
//       .skip(skip)
//       .select('-password -__v') // ẩn thêm __v cho sạch
//       .sort(sort as any)
//       .lean<SafeUser[]>(); // lean để trả plain object, nhẹ hơn

//     return { results, totalPages, totalItems, current: _current, pageSize: _pageSize };
//   }

//   /**
//    * GET /users/:id
//    * Lưu ý: id của Mongo là string ObjectId. Đừng ép +id ở controller.
//    */
//   async findOne(id: string): Promise<SafeUser | null> {
//     if (!mongoose.isValidObjectId(id)) {
//       throw new BadRequestException('id không hợp lệ');
//     }
//     return this.userModel.findById(id).select('-password -__v').lean<SafeUser>().exec();
//   }

//   /**
//    * PATCH /users
//    * Controller truyền vào UpdateUserDto; ở đây chấp nhận tối thiểu {_id, ...fields}
//    */
//   async update(updateUserDto: { _id: string } & Partial<User>) {
//     const { _id, ...update } = updateUserDto || ({} as any);
//     if (!_id || !mongoose.isValidObjectId(_id)) {
//       throw new BadRequestException('id không hợp lệ');
//     }
//     // Không cho update password trực tiếp qua endpoint này (nên có flow riêng)
//     delete (update as any)?.password;
//     delete (update as any)?._id;

//     return this.userModel.updateOne({ _id }, { $set: update }, { runValidators: true }).exec();
//   }

//   /**
//    * DELETE /users/:id
//    */
//   async remove(id: string) {
//     if (!mongoose.isValidObjectId(id)) {
//       throw new BadRequestException('id không hợp lệ');
//     }
//     return this.userModel.deleteOne({ _id: id }).exec();
//   }
// }
