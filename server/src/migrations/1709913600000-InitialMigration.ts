import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1709913600000 implements MigrationInterface {
    name = 'InitialMigration1709913600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not already enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // Create user table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "name" character varying,
                "role" character varying NOT NULL DEFAULT 'user',
                "trialStartDate" TIMESTAMP NOT NULL,
                "trialEndDate" TIMESTAMP NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "hasActiveSubscription" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

        // Create qr_code table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "qr_code" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "type" character varying NOT NULL DEFAULT 'url',
                "url" character varying,
                "originalUrl" character varying,
                "links" jsonb NOT NULL DEFAULT '[]',
                "menu" jsonb,
                "logoUrl" character varying,
                "foregroundColor" character varying NOT NULL,
                "backgroundColor" character varying NOT NULL,
                "textAbove" character varying,
                "textBelow" character varying,
                "scanCount" integer NOT NULL DEFAULT '0',
                "scanHistory" jsonb NOT NULL DEFAULT '[]',
                "vitrine" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_2844e0c3d4b6aec436e4f63c4c4" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_2844e0c3d4b6aec436e4f63c4c4'
                ) THEN
                    ALTER TABLE "qr_code" 
                    ADD CONSTRAINT "FK_2844e0c3d4b6aec436e4f63c4c4" 
                    FOREIGN KEY ("userId") 
                    REFERENCES "user"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qr_code" DROP CONSTRAINT IF EXISTS "FK_2844e0c3d4b6aec436e4f63c4c4"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "qr_code"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    }
} 