import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneToUser1710000000000 implements MigrationInterface {
    name = 'AddPhoneToUser1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
    }
} 