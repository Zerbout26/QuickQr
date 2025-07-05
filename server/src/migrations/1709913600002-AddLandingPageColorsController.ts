import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLandingPageColorsController1709913600002 implements MigrationInterface {
    name = 'AddLandingPageColorsController1709913600002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add landing page color columns to qr_code table
        await queryRunner.query(`
            ALTER TABLE "qr_code" 
            ADD COLUMN IF NOT EXISTS "primaryColor" character varying DEFAULT '#3b82f6',
            ADD COLUMN IF NOT EXISTS "primaryHoverColor" character varying DEFAULT '#2563eb',
            ADD COLUMN IF NOT EXISTS "accentColor" character varying DEFAULT '#64748b',
            ADD COLUMN IF NOT EXISTS "backgroundGradient" character varying DEFAULT 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 25%, white 50%, #64748b08 75%, #64748b15 100%)',
            ADD COLUMN IF NOT EXISTS "loadingSpinnerColor" character varying DEFAULT '#3b82f6',
            ADD COLUMN IF NOT EXISTS "loadingSpinnerBorderColor" character varying DEFAULT 'rgba(59, 130, 246, 0.2)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove landing page color columns from qr_code table
        await queryRunner.query(`
            ALTER TABLE "qr_code" 
            DROP COLUMN IF EXISTS "primaryColor",
            DROP COLUMN IF EXISTS "primaryHoverColor",
            DROP COLUMN IF EXISTS "accentColor",
            DROP COLUMN IF EXISTS "backgroundGradient",
            DROP COLUMN IF EXISTS "loadingSpinnerColor",
            DROP COLUMN IF EXISTS "loadingSpinnerBorderColor"
        `);
    }
} 