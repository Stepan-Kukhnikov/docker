import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByUsername(username);
      
      const isPasswordValid = await this.hashService.verifyPassword(
        password,
        user.password,
      );

      if (isPasswordValid) {
        return user;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
