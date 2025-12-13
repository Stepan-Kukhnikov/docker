import { IsString, Length, IsUrl, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsUrl()
  image: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}
