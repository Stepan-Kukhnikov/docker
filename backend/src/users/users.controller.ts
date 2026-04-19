import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('find')
  async findUsers(@Body() searchDto: { query: string }) {
    return this.usersService.searchUsers(searchDto.query);
  }

  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get('me/wishes')
  async getMyWishes(@Request() req) {
    return this.usersService.getUserWishes(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return this.usersService.getUserWishesByUsername(username);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
