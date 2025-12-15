import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashService } from '../hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email или username уже существует');
    }

    const hashedPassword = await this.hashService.hashPassword(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(query);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findMany(query: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(query);
  }

  async searchUsers(query: string): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
    
    return users.map(({ password, ...user }) => user);
  }

  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.findOne({
      where: { id: userId },
    });
    
    const { password, ...result } = user;
    return result;
  }

  async getUserWishes(userId: number) {
    const user = await this.findOne({
      where: { id: userId },
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });
    
    return user.wishes;
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.updateOne(
      { where: { id: userId } },
      updateUserDto,
    );
    
    const { password, ...result } = user;
    return result;
  }

  async getUserByUsername(username: string): Promise<Partial<User>> {
    const user = await this.findOne({
      where: { username },
      relations: ['wishes', 'wishlists'],
    });
    
    const { password, ...result } = user;
    return result;
  }

  async getUserWishesByUsername(username: string) {
    const user = await this.findOne({
      where: { username },
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });
    
    return user.wishes;
  }

  async findAll(): Promise<User[]> {
    return await this.findMany({});
  }

  async updateOne(
    query: FindOneOptions<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(query);
    
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hashPassword(updateUserDto.password);
    }
    
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async removeOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.findOne(query);
    return await this.userRepository.remove(user);
  }

  async findByUsername(username: string): Promise<User> {
    return await this.findOne({ where: { username } });
  }
}
