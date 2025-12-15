import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Body() createOfferDto: CreateOfferDto, @Request() req) {
    return this.offersService.createOffer(createOfferDto, req.user);
  }

  @Get()
  findAll() {
    return this.offersService.findAllOffers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOfferById(id);
  }
}