import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString() id: string;
  @IsString() name: string;
  @IsString() slug: string;
  @IsNumber() price: number;
  @IsOptional() @IsArray() tags?: string[];
}
