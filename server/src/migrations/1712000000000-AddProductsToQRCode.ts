import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductsToQRCode1712000000000 implements MigrationInterface {
    name = 'AddProductsToQRCode1712000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qr_code" ADD "products" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qr_code" DROP COLUMN "products"`);
    }
} 