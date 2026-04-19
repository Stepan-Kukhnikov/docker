import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { Offer } from '../offers/entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { excludePassword } from '../utils/exclude-password.helper';

export interface SanitizedOffer {
  id: number;
  amount: number;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: (Partial<User> & { profileUrl?: string }) | null;
}

export interface WishWithSanitizedOffers {
  id: number;
  name: string;
  link: string;
  image: string;
  price: number;
  description: string;
  copied: number;
  raised: number;
  createdAt: Date;
  updatedAt: Date;
  owner: Omit<User, 'password'>;
  offers: SanitizedOffer[];
}

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  async createWish(createWishDto: CreateWishDto, user: User): Promise<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }> {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });
    const saved = await this.wishRepository.save(wish);
    
    return {
      ...saved,
      owner: excludePassword(saved.owner),
    };
  }

  async findOneWithOffers(id: number): Promise<WishWithSanitizedOffers> {
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

    const ownerWithoutPassword = excludePassword(wish.owner);

    const sanitizedOffers: SanitizedOffer[] = offers.map((offer) => {
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

      if (offer.user) {
        const userWithoutPassword = excludePassword(offer.user);
        return {
          id: offer.id,
          amount: offer.amount,
          hidden: offer.hidden,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
          user: {
            ...userWithoutPassword,
            profileUrl: `/users/${userWithoutPassword.username}`,
          },
        };
      }

      return {
        id: offer.id,
        amount: offer.amount,
        hidden: offer.hidden,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        user: null,
      };
    });

    return {
      id: wish.id,
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      copied: wish.copied,
      raised: wish.raised,
      createdAt: wish.createdAt,
      updatedAt: wish.updatedAt,
      owner: ownerWithoutPassword,
      offers: sanitizedOffers,
    };
  }

  async updateWish(wishId: number, updateWishDto: UpdateWishDto, userId: number): Promise<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }> {
    const wish = await this.updateOne(
      { where: { id: wishId, owner: { id: userId } } },
      updateWishDto,
    );
    
    return {
      ...wish,
      owner: excludePassword(wish.owner),
    };
  }

  async removeWish(wishId: number, userId: number): Promise<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }> {
    const wish = await this.removeOne({
      where: { id: wishId, owner: { id: userId } },
    });
    
    return {
      ...wish,
      owner: excludePassword(wish.owner),
    };
  }

  async copyWish(wishId: number, user: User): Promise<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }> {
    const originalWish = await this.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });

    await this.incrementCopied(wishId);

    const { id, copied, raised, owner, createdAt, updatedAt, ...wishData } = originalWish;

    return this.createWish(wishData as CreateWishDto, user);
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

  async findLast(limit: number = 40): Promise<Array<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }>> {
    const wishes = await this.findMany({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
    
    return wishes.map(wish => ({
      ...wish,
      owner: excludePassword(wish.owner),
    }));
  }

  async findTop(limit: number = 20): Promise<Array<Omit<Wish, 'owner'> & { owner: Omit<User, 'password'> }>> {
    const wishes = await this.findMany({
      order: { copied: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
    
    return wishes.map(wish => ({
      ...wish,
      owner: excludePassword(wish.owner),
    }));
  }
}