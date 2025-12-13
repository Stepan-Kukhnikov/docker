import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createWishlistDto: CreateWishlistDto, @Request() req) {
    
    return await this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get()
  findAll() {
    return this.wishlistsService.findMany({
      relations: ['owner', 'items', 'items.owner'],
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishlistsService.findOne({
      where: { id: +id },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return await this.wishlistsService.updateOne(
      { where: { id: +id } },
      updateWishlistDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistsService.removeOne({ where: { id: +id } });
  }
}
