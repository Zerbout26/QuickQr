import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardOrderSupport1714000000000 implements MigrationInterface {
    name = 'AddCardOrderSupport1714000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make qrCodeId and qrCodeOwnerId nullable to support card orders
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "qrCodeId" DROP NOT NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "qrCodeOwnerId" DROP NOT NULL
        `);

        // Add card order specific fields
        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD COLUMN "orderType" VARCHAR(50) DEFAULT 'qr_order'
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD COLUMN "cardType" VARCHAR(50)
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD COLUMN "cardQuantity" INTEGER
        `);

        // Add index for orderType
        await queryRunner.query(`
            CREATE INDEX "IDX_order_orderType" ON "order" ("orderType")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove card order specific fields
        await queryRunner.query(`
            ALTER TABLE "order" 
            DROP COLUMN "cardQuantity"
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            DROP COLUMN "cardType"
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            DROP COLUMN "orderType"
        `);

        // Remove index
        await queryRunner.query(`
            DROP INDEX "IDX_order_orderType"
        `);

        // Make qrCodeId and qrCodeOwnerId required again
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "qrCodeId" SET NOT NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "order" 
            ALTER COLUMN "qrCodeOwnerId" SET NOT NULL
        `);
    }
} 