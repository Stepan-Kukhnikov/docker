import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { excludePassword } from '../utils/exclude-password.helper';
@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async createWishlist(createWishlistDto: CreateWishlistDto, owner: User) {
    const { itemsId, ...wishlistData } = createWishlistDto;
    
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
    const result = await this.findOne({
      where: { id: saved.id },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
    
    return this.sanitizeWishlist(result);
  }

  private sanitizeWishlist(wishlist: Wishlist) {
    return {
      ...wishlist,
      owner: excludePassword(wishlist.owner),
      items: wishlist.items?.map(item => ({
        ...item,
        owner: excludePassword(item.owner),
      })),
    };
  }

  async findAllWishlists() {
    const wishlists = await this.findMany({
      relations: ['owner', 'items', 'items.owner'],
    });
    
    return wishlists.map(wishlist => this.sanitizeWishlist(wishlist));
  }

  async findWishlistById(id: string) {
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      throw new NotFoundException('Неверный ID');
    }

    const wishlist = await this.findOne({
      where: { id: numericId },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
    
    return this.sanitizeWishlist(wishlist);
  }

  async updateWishlist(id: string, updateWishlistDto: UpdateWishlistDto, userId: number) {
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      throw new NotFoundException('Неверный ID');
    }

    const wishlist = await this.findOne({
      where: { id: numericId },
      relations: ['owner'],
    });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой список желаний');
    }

    interface UpdateDtoWithItemsId extends UpdateWishlistDto {
      itemsId?: number[];
    }
    
    const { itemsId, ...wishlistData } = updateWishlistDto as UpdateDtoWithItemsId;
    
    Object.assign(wishlist, wishlistData);
    
    if (itemsId) {
      const wishes = await this.wishRepository.find({
        where: { id: In(itemsId) },
        relations: ['owner', 'offers'],
      });
      wishlist.items = wishes;
    }
    
    const saved = await this.wishlistRepository.save(wishlist);
    const result = await this.findOne({
      where: { id: saved.id },
      relations: ['owner', 'items', 'items.owner', 'items.offers'],
    });
    
    return this.sanitizeWishlist(result);
  }

  async removeWishlist(id: string, userId: number) {
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      throw new NotFoundException('Неверный ID');
    }

    const wishlist = await this.findOne({
      where: { id: numericId },
      relations: ['owner'],
    });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой список желаний');
    }

    const removed = await this.wishlistRepository.remove(wishlist);
    return this.sanitizeWishlist(removed);
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

  async updateOne(query: FindOneOptions<Wishlist>, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
    interface UpdateDtoWithItemsId extends UpdateWishlistDto {
      itemsId?: number[];
    }
    
    const { itemsId, ...wishlistData } = updateWishlistDto as UpdateDtoWithItemsId;
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