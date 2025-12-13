import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, owner: User): Promise<Wishlist> {
    const { itemsId, ...wishlistData } = createWishlistDto;
    
    console.log('Create wishlist - owner:', owner);
    console.log('Create wishlist - data:', wishlistData);
    
    const wishlist = this.wishlistRepository.create({
      ...wishlistData,
      owner,
    });
    
    if (itemsId && itemsId.length > 0) {
      const wishes = await this.wishRepository.find({
        where: { id: In(itemsId) },
        relations: ['owner', 'offers'],
      });
      wishlist.items = wishes;
    }
    
    const saved = await this.wishlistRepository.save(wishlist);
    return await this.findOne({
      where: { id: saved.id },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne(query);
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    return wishlist;
  }

  async findMany(query: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return await this.wishlistRepository.find(query);
  }

  async updateOne(
    query: FindOneOptions<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const { itemsId, ...wishlistData } = updateWishlistDto as any;
    const wishlist = await this.findOne(query);
    
    Object.assign(wishlist, wishlistData);
    if (itemsId) {
      const wishes = await this.wishRepository.find({
        where: { id: In(itemsId) },
        relations: ['owner', 'offers'],
      });
      wishlist.items = wishes;
    }
    
    const saved = await this.wishlistRepository.save(wishlist);
    return await this.findOne({
      where: { id: saved.id },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
  }

  async removeOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.findOne(query);
    return await this.wishlistRepository.remove(wishlist);
  }
}
