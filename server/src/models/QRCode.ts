import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

export type QRCodeType = 'url' | 'menu' | 'both' | 'direct' | 'vitrine';

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Link {
  label: string;
  url: string;
  type?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp' | 'telegram' | 'website' | 'other';
}

export interface VitrineSection {
  hero: {
    businessName: string;
    logo?: string;
    tagline: string;
    cta: {
      text: string;
      link: string;
    };
  };
  about: {
    description: string;
    city: string;
  };
  services: Array<{
    name: string;
    description?: string;
    imageUrl?: string;
    title?: string;
    imageDescription?: string;
  }>;
  gallery: Array<{
    imageUrl: string;
    title?: string;
    description?: string;
  }>;
  testimonials: Array<{
    text: string;
    author: string;
    city?: string;
  }>;
  contact: {
    address?: string;
    phone: string;
    email: string;
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
    contactForm?: {
      enabled: boolean;
      fields: Array<{
        name: string;
        type: 'text' | 'email' | 'phone' | 'textarea';
        required: boolean;
      }>;
    };
  };
  footer: {
    copyright: string;
    businessName: string;
    quickLinks: Array<{
      label: string;
      url: string;
    }>;
    socialIcons: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
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
  links!: { label: string; url: string; type: string }[];

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

  @Column({ nullable: true })
  textAbove!: string;

  @Column({ nullable: true })
  textBelow!: string;

  @Column({ type: "int", default: 0 })
  scanCount!: number;

  @Column("simple-json", { nullable: true, default: "[]" })
  scanHistory!: {
    timestamp: Date;
    userAgent: string;
    ipAddress: string;
  }[];

  @Column("simple-json", { nullable: true })
  vitrine!: VitrineSection;

  @ManyToOne(() => User, user => user.qrCodes)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 