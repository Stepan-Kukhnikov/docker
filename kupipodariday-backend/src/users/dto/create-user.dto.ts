import { IsEmail, IsString, Length, MinLength, IsUrl, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  about?: string;
}
