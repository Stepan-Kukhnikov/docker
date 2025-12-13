import { PartialType } from '@nestjs/mapped-types';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}