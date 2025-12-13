import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, IsBoolean, Min } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @Column({ default: false })
  @IsBoolean()
  hidden: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  @JoinColumn({ name: 'itemId' })
  item: Wish;
}
