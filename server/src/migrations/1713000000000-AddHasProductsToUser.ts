import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHasProductsToUser1713000000000 implements MigrationInterface {
    name = 'AddHasProductsToUser1713000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hasProducts" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hasProducts"`);
    }
} 