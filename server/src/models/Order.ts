import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from "typeorm";
import { User } from "./User";
import { QRCode } from "./QRCode";

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'delivered';

export interface OrderItem {
  key: string; // categoryIndex-itemIndex
  itemName: string;
  categoryName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  selectedVariants?: { [variantName: string]: string };
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Index()
  orderNumber!: string;

  @Column("simple-json")
  items!: OrderItem[];

  @Column("simple-json")
  customerInfo!: CustomerInfo;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: "enum",
    enum: ["pending", "confirmed", "cancelled", "delivered"],
    default: "pending"
  })
  @Index()
  status!: OrderStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  adminNotes?: string;

  @ManyToOne(() => QRCode, { onDelete: 'CASCADE', nullable: true })
  qrCode?: QRCode;

  @Column({ nullable: true })
  qrCodeId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  qrCodeOwner?: User;

  @Column({ nullable: true })
  qrCodeOwnerId?: string;

  @Column({ default: 'qr_order' })
  orderType!: string;

  @Column({ nullable: true })
  cardType?: string;

  @Column({ nullable: true })
  cardQuantity?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  confirmedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  deliveredAt?: Date;
} 