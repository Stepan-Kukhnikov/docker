import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log('Загрузка подарка с ID:', id);
    const wishId = parseInt(id, 10);
    
    if (isNaN(wishId)) {
      throw new NotFoundException('Неверный ID подарка');
    }
    
    return this.wishesService.findOneWithOffers(wishId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createWishDto: CreateWishDto, @Req() req: any) {
    return this.wishesService.create({
      ...createWishDto,
      owner: req.user,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: any,
  ) {
    const wishId = parseInt(id, 10);
    return this.wishesService.updateOne(
      { where: { id: wishId, owner: { id: req.user.id } } },
      updateWishDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const wishId = parseInt(id, 10);
    return this.wishesService.removeOne({
      where: { id: wishId, owner: { id: req.user.id } },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copy(@Param('id') id: string, @Req() req: any) {
    const wishId = parseInt(id, 10);
    const originalWish = await this.wishesService.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });

    await this.wishesService.incrementCopied(wishId);

    const { id: _, copied, raised, offers, ...wishData } = originalWish as any;

    return this.wishesService.create({
      ...wishData,
      owner: req.user,
    });
  }
}
