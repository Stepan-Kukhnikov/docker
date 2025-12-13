import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { Offer } from '../offers/entities/offer.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}


  async create(createWishDto: any): Promise<any> {
    const wish = this.wishRepository.create(createWishDto);
    await this.wishRepository.save(wish);
    return wish;
  }

  async findOneWithOffers(id: number): Promise<any> {
  const wish = await this.wishRepository.findOne({
    where: { id },
    relations: ['owner'],
  });

  if (!wish) {
    throw new NotFoundException('Подарок не найден');
  }

  const offers = await this.offerRepository.find({
    where: { item: { id } },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });

  const plainWish = JSON.parse(JSON.stringify(wish));
  const plainOffers = JSON.parse(JSON.stringify(offers));

  if (plainWish.owner?.password) {
    delete plainWish.owner.password;
  }

  const sanitizedOffers = plainOffers.map((offer: any) => {
    if (offer.user?.password) {
      delete offer.user.password;
    }

    if (offer.hidden) {
      return {
        id: offer.id,
        amount: offer.amount,
        hidden: true,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        user: null,
      };
    }

    return {
      ...offer,
      user: offer.user ? {
        ...offer.user,
        profileUrl: `/users/${offer.user.username}`,
      } : null,
    };
  });

  const result = {
    ...plainWish,
    offers: sanitizedOffers,
  };

  return result;
}


  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.wishRepository.findOne(query);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async findMany(query: FindManyOptions<Wish>): Promise<Wish[]> {
    return await this.wishRepository.find(query);
  }

  async updateOne(
    query: FindOneOptions<Wish>,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne(query);
    Object.assign(wish, updateWishDto);
    return await this.wishRepository.save(wish);
  }

  async removeOne(query: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.findOne(query);
    return await this.wishRepository.remove(wish);
  }

  async incrementCopied(id: number): Promise<void> {
    await this.wishRepository.increment({ id }, 'copied', 1);
  }

  async findLast(limit: number = 40): Promise<Wish[]> {
    return await this.findMany({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
  }

  async findTop(limit: number = 20): Promise<Wish[]> {
    return await this.findMany({
      order: { copied: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
  }
}
