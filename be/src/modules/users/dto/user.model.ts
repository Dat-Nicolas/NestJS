// // users/dto/user.model.ts
// import { Field, ID, ObjectType } from '@nestjs/graphql';

// @ObjectType()
// export class UserModel {
//   @Field(() => ID) id: string;
//   @Field() email: string;
//   @Field({ nullable: true }) name?: string;
//   @Field({ nullable: true }) avatar?: string;
//   @Field() createdAt: Date;
// }

// // users/dto/create-user.input.ts
// import { Field, InputType } from '@nestjs/graphql';
// import { IsEmail, MinLength } from 'class-validator';

// @InputType()
// export class CreateUserInput {
//   @Field() @IsEmail() email: string;
//   @Field() @MinLength(6) password: string;
//   @Field({ nullable: true }) name?: string;
// }
