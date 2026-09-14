import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Permite que los planes de financiación puedan tener una tasa directa (financing_rate)
 * sin requerir obligatoriamente financing_config_id.
 * Amplía la precisión de tasas en FINANCING_CONFIGURATIONS, FINANCING_PLANS y PROMOTIONS
 * para permitir porcentajes mayores al 100% (mínimo 500%+).
 */
export class AddFinancingRateToPlansAndFixRates20260912000001
    implements MigrationInterface {
    name = "AddFinancingRateToPlansAndFixRates20260912000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. En FINANCING_PLANS: hacer financing_config_id nullable y agregar financing_rate
        await queryRunner.query(`
      ALTER TABLE "FINANCING_PLANS"
        ALTER COLUMN financing_config_id DROP NOT NULL;
    `);

        await queryRunner.query(`
      ALTER TABLE "FINANCING_PLANS"
        ADD COLUMN IF NOT EXISTS financing_rate numeric(10,4);
    `);

        // 2. En FINANCING_CONFIGURATIONS: ampliar precisión para tasas altas
        await queryRunner.query(`
      ALTER TABLE "FINANCING_CONFIGURATIONS"
        ALTER COLUMN financing_rate TYPE numeric(10,4);
    `);

        // 3. En PROMOTIONS: ampliar precisión y quitar tope de 100%
        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        DROP CONSTRAINT IF EXISTS chk_promotion_discount;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ALTER COLUMN discount_percentage TYPE numeric(10,4);
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ADD CONSTRAINT chk_promotion_discount
        CHECK (discount_percentage IS NULL OR discount_percentage >= -1);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        DROP CONSTRAINT IF EXISTS chk_promotion_discount;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ADD CONSTRAINT chk_promotion_discount
        CHECK (discount_percentage IS NULL OR (discount_percentage >= -1 AND discount_percentage <= 1));
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ALTER COLUMN discount_percentage TYPE numeric(5,4);
    `);

        await queryRunner.query(`
      ALTER TABLE "FINANCING_CONFIGURATIONS"
        ALTER COLUMN financing_rate TYPE numeric(5,4);
    `);

        await queryRunner.query(`
      ALTER TABLE "FINANCING_PLANS"
        DROP COLUMN IF EXISTS financing_rate;
    `);

        await queryRunner.query(`
      ALTER TABLE "FINANCING_PLANS"
        ALTER COLUMN financing_config_id SET NOT NULL;
    `);
    }
}
