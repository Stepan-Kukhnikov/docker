import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async findUsers(@Body() searchDto: { query: string }) {
    const users = await this.usersService.findMany({
      where: [
        { username: searchDto.query },
        { email: searchDto.query },
      ],
    });
    
    return users.map(({ password, ...user }) => user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    const { password, ...result } = req.user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getMyWishes(@Request() req) {
    const user = await this.usersService.findOne({
      where: { id: req.user.id },
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });
    return user.wishes;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateOne(
      { where: { id: req.user.id } },
      updateUserDto,
    );
    const { password, ...result } = user;
    return result;
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne({
      where: { username },
      relations: ['wishes', 'wishlists'],
    });
    const { password, ...result } = user;
    return result;
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findOne({
      where: { username },
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });
    return user.wishes;
  }

  @Get()
  findAll() {
    return this.usersService.findMany({});
  }
}
