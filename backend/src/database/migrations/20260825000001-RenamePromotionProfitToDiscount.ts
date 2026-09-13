import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Renombra profit_percentage a discount_percentage en PROMOTIONS.
 * El campo pasa a representar un ajuste con signo sobre la tasa base:
 * negativo = descuento al cliente, positivo = recargo.
 */
export class RenamePromotionProfitToDiscount20260825000001
    implements MigrationInterface {
    name = "RenamePromotionProfitToDiscount20260825000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        DROP CONSTRAINT IF EXISTS chk_promotion_profit;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        RENAME COLUMN profit_percentage TO discount_percentage;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ADD CONSTRAINT chk_promotion_discount
        CHECK (discount_percentage IS NULL OR (discount_percentage >= -1 AND discount_percentage <= 1));
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        DROP CONSTRAINT IF EXISTS chk_promotion_discount;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        RENAME COLUMN discount_percentage TO profit_percentage;
    `);

        await queryRunner.query(`
      ALTER TABLE "PROMOTIONS"
        ADD CONSTRAINT chk_promotion_profit
        CHECK (profit_percentage IS NULL OR (profit_percentage >= 0 AND profit_percentage <= 1));
    `);
    }
}
