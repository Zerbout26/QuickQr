import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { QRCode } from "./QRCode";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: "varchar",
    default: "user"
  })
  role: string;

  @Column({ type: "datetime" })
  trialStartDate: Date;

  @Column({ type: "datetime" })
  trialEndDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasActiveSubscription: boolean;

  @OneToMany(() => QRCode, qrCode => qrCode.user)
  qrCodes: QRCode[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 