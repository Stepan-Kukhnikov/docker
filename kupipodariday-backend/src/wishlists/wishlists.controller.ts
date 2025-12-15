import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  async create(@Body() createWishlistDto: CreateWishlistDto, @Request() req) {
    return this.wishlistsService.createWishlist(createWishlistDto, req.user);
  }

  @Get()
  findAll() {
    return this.wishlistsService.findAllWishlists();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wishlistsService.findWishlistById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Request() req,
  ) {
    return this.wishlistsService.updateWishlist(id, updateWishlistDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.wishlistsService.removeWishlist(id, req.user.id);
  }
}