import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

export type QRCodeType = 'url' | 'menu';

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

@Entity()
export class QRCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: "varchar",
    default: 'url'
  })
  type!: QRCodeType;

  @Column({ nullable: true })
  url!: string;

  @Column({ nullable: true })
  originalUrl!: string;

  @Column("simple-json", { nullable: true, default: "[]" })
  links!: { label: string; url: string }[];

  @Column("simple-json", { nullable: true })
  menu!: {
    restaurantName: string;
    description?: string;
    categories: MenuCategory[];
  };

  @Column({ nullable: true })
  logoUrl!: string;

  @Column()
  foregroundColor!: string;

  @Column()
  backgroundColor!: string;

  @ManyToOne(() => User, user => user.qrCodes)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 