import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsString, Length, IsUrl } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  @IsString()
  @Length(1, 250)
  name: string;

  @Column({ length: 1500, nullable: true })
  @IsString()
  @Length(0, 1500)
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.wishlists, { 
    eager: false 
  })
  owner: User;

  @ManyToMany(() => Wish, (wish) => wish.wishlists, { eager: false })
  @JoinTable()
  items: Wish[];
}
