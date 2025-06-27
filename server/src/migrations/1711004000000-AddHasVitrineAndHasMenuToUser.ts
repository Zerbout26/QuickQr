import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHasVitrineAndHasMenuToUser1711004000000 implements MigrationInterface {
    name = 'AddHasVitrineAndHasMenuToUser1711004000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hasVitrine" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hasMenu" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "hasVitrine"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "hasMenu"`);
    }
} 