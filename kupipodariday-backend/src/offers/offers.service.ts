import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const { itemId, amount, hidden } = createOfferDto;

    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException('Нельзя вносить деньги на собственные подарки');
    }

    const raised = parseFloat(wish.raised.toString());
    const price = parseFloat(wish.price.toString());
    const remaining = price - raised;

    if (amount > remaining) {
      throw new BadRequestException(
        `Сумма превышает оставшуюся стоимость подарка (осталось собрать: ${remaining})`,
      );
    }

    const offer = this.offerRepository.create({
      amount,
      hidden: hidden || false,
      user,
      item: wish,
    });

    const saved = await this.offerRepository.save(offer);

    wish.raised = (raised + amount).toFixed(2) as any;
    await this.wishRepository.save(wish);

    return saved;
  }

  async findOne(query: FindOneOptions<Offer>): Promise<Offer> {
    const offer = await this.offerRepository.findOne(query);
    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }
    return offer;
  }

  async findMany(query: FindManyOptions<Offer>): Promise<Offer[]> {
    return await this.offerRepository.find(query);
  }

  async updateOne(
    query: FindOneOptions<Offer>,
    updateOfferDto: UpdateOfferDto,
  ): Promise<Offer> {
    throw new ForbiddenException('Редактирование заявок запрещено');
  }

  async removeOne(query: FindOneOptions<Offer>): Promise<Offer> {
    throw new ForbiddenException('Удаление заявок запрещено');
  }
}
