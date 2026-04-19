import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface JwtPayload {
  username: string;
  sub: number;
}

export interface LoginResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  async validateUser(username: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByUsername(username);
    
    if (user && await this.hashService.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: UserWithoutPassword): Promise<LoginResponse> {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}