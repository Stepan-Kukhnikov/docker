import { IsString, Length, IsUrl, IsNumber, Min, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsString()
  @Length(1, 1024)
  description?: string;

  @IsOptional()
  owner?: User;
}
