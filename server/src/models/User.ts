import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { QRCode } from "./QRCode";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: "varchar",
    default: "user"
  })
  role!: string;

  @Column({ type: "timestamp" })
  trialStartDate!: Date;

  @Column({ type: "timestamp" })
  trialEndDate!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  hasActiveSubscription!: boolean;

  @Column({ default: false })
  hasVitrine!: boolean;

  @Column({ default: false })
  hasMenu!: boolean;

  @Column({ default: false })
  hasProducts!: boolean;

  @OneToMany(() => QRCode, qrCode => qrCode.user)
  qrCodes!: QRCode[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 