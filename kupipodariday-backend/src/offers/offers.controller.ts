import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOfferDto: CreateOfferDto, @Request() req) {
    return await this.offersService.create(createOfferDto, req.user);
  }

  @Get()
  findAll() {
    return this.offersService.findMany({
      relations: ['user', 'item', 'item.owner'],
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne({
      where: { id: +id },
      relations: ['user', 'item', 'item.owner'],
    });
  }
}
