import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService, UserWithoutPassword, LoginResponse } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

interface RequestWithUser extends Request {
  user: UserWithoutPassword;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    return this.authService.signup(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Request() req: RequestWithUser): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }
}
