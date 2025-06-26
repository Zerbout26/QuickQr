import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodFormEnabledToMenu1711002000000 implements MigrationInterface {
    name = 'AddCodFormEnabledToMenu1711002000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing menu JSON to include codFormEnabled: false if not present
        // Handle both text and jsonb column types
        await queryRunner.query(`
            UPDATE "qr_code" 
            SET "menu" = jsonb_set(
                COALESCE("menu"::jsonb, '{}'::jsonb),
                '{codFormEnabled}',
                'false'::jsonb
            )
            WHERE "menu" IS NOT NULL 
            AND NOT ("menu"::jsonb ? 'codFormEnabled')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove codFormEnabled field from menu JSON
        await queryRunner.query(`
            UPDATE "qr_code" 
            SET "menu" = ("menu"::jsonb - 'codFormEnabled')::text
            WHERE "menu" IS NOT NULL 
            AND ("menu"::jsonb ? 'codFormEnabled')
        `);
    }
} 