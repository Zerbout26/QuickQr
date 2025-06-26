import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTable1711003000000 implements MigrationInterface {
    name = 'CreateOrderTable1711003000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create order_status enum
        await queryRunner.query(`
            CREATE TYPE "order_status_enum" AS ENUM ('pending', 'confirmed', 'cancelled', 'delivered')
        `);

        // Create order table
        await queryRunner.query(`
            CREATE TABLE "order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderNumber" character varying NOT NULL,
                "items" jsonb NOT NULL,
                "customerInfo" jsonb NOT NULL,
                "totalAmount" decimal(10,2) NOT NULL,
                "status" "order_status_enum" NOT NULL DEFAULT 'pending',
                "notes" character varying,
                "adminNotes" character varying,
                "qrCodeId" uuid NOT NULL,
                "qrCodeOwnerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "confirmedAt" TIMESTAMP,
                "cancelledAt" TIMESTAMP,
                "deliveredAt" TIMESTAMP,
                CONSTRAINT "PK_order_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_order_orderNumber" ON "order" ("orderNumber")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_status" ON "order" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_qrCodeId" ON "order" ("qrCodeId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_qrCodeOwnerId" ON "order" ("qrCodeOwnerId")
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD CONSTRAINT "FK_order_qrCode" 
            FOREIGN KEY ("qrCodeId") 
            REFERENCES "qr_code"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "order" 
            ADD CONSTRAINT "FK_order_qrCodeOwner" 
            FOREIGN KEY ("qrCodeOwnerId") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_order_qrCodeOwner"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_order_qrCode"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_order_qrCodeOwnerId"`);
        await queryRunner.query(`DROP INDEX "IDX_order_qrCodeId"`);
        await queryRunner.query(`DROP INDEX "IDX_order_status"`);
        await queryRunner.query(`DROP INDEX "IDX_order_orderNumber"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "order"`);

        // Drop enum
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
    }
} 