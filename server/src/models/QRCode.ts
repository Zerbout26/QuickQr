import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class QRCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @Column()
  originalUrl!: string;

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