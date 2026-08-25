import { MigrationInterface, QueryRunner } from "typeorm";

export class FinancingPlansPromotionsSchema20260823000001
  implements MigrationInterface {
  name = "FinancingPlansPromotionsSchema20260823000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // La base está en desarrollo y el modelo anterior de financiación
    // (3/6/9 cuotas y overrides por producto) queda reemplazado.
    await queryRunner.query(`
      DROP TABLE IF EXISTS "FINANCING_CONFIG_PRODUCTS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "FINANCING_PLANS_PRODUCTS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "FINANCING_PLAN_PRODUCTS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "PROMOTION_PRODUCTS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "PROMOTIONS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "FINANCING_PLANS";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "FINANCING_CONFIGURATIONS";
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'payment_frequency_enum'
        ) THEN
          CREATE TYPE payment_frequency_enum AS ENUM (
            'daily',
            'biweekly',
            'weekly',
            'monthly'
          );
        ELSE
          ALTER TYPE payment_frequency_enum ADD VALUE IF NOT EXISTS 'daily';
          ALTER TYPE payment_frequency_enum ADD VALUE IF NOT EXISTS 'biweekly';
          ALTER TYPE payment_frequency_enum ADD VALUE IF NOT EXISTS 'weekly';
          ALTER TYPE payment_frequency_enum ADD VALUE IF NOT EXISTS 'monthly';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE "FINANCING_CONFIGURATIONS" (
        financing_config_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id uuid NOT NULL,
        name varchar(150) NOT NULL,
        financing_rate numeric(5,4) NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        is_global boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_financing_config_society
      ON "FINANCING_CONFIGURATIONS" (society_id);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_financing_config_society_name
      ON "FINANCING_CONFIGURATIONS" (society_id, lower(name));
    `);

    await queryRunner.query(`
      CREATE TABLE "FINANCING_CONFIG_PRODUCTS" (
        financing_config_id uuid NOT NULL,
        product_id uuid NOT NULL,
        PRIMARY KEY (financing_config_id, product_id),
        CONSTRAINT fk_financing_config_products_config
          FOREIGN KEY (financing_config_id)
          REFERENCES "FINANCING_CONFIGURATIONS"(financing_config_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_financing_config_products_product
          FOREIGN KEY (product_id)
          REFERENCES "PRODUCTS"(product_id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_financing_config_products_product
      ON "FINANCING_CONFIG_PRODUCTS" (product_id);
    `);

    await queryRunner.query(`
      CREATE TABLE "FINANCING_PLANS" (
        financing_plan_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id uuid NOT NULL,
        name varchar(150) NOT NULL,
        financing_config_id uuid NOT NULL,
        payment_frequency payment_frequency_enum NOT NULL,
        installments_count integer NOT NULL,
        is_global boolean NOT NULL DEFAULT true,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_financing_plans_financing
          FOREIGN KEY (financing_config_id)
          REFERENCES "FINANCING_CONFIGURATIONS"(financing_config_id)
          ON DELETE RESTRICT,
        CONSTRAINT chk_financing_plan_installments
          CHECK (installments_count > 0)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_financing_plans_society
      ON "FINANCING_PLANS" (society_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_financing_plans_financing
      ON "FINANCING_PLANS" (financing_config_id);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_financing_plans_society_name
      ON "FINANCING_PLANS" (society_id, lower(name));
    `);

    await queryRunner.query(`
      CREATE TABLE "FINANCING_PLAN_PRODUCTS" (
        financing_plan_id uuid NOT NULL,
        product_id uuid NOT NULL,
        PRIMARY KEY (financing_plan_id, product_id),
        CONSTRAINT fk_financing_plan_products_plan
          FOREIGN KEY (financing_plan_id)
          REFERENCES "FINANCING_PLANS"(financing_plan_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_financing_plan_products_product
          FOREIGN KEY (product_id)
          REFERENCES "PRODUCTS"(product_id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_financing_plan_products_product
      ON "FINANCING_PLAN_PRODUCTS" (product_id);
    `);

    await queryRunner.query(`
      CREATE TABLE "PROMOTIONS" (
        promotion_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        society_id uuid NOT NULL,
        name varchar(150) NOT NULL,
        financing_plan_id uuid,
        profit_percentage numeric(5,4),
        payment_frequency payment_frequency_enum,
        installments_count integer,
        is_global boolean NOT NULL DEFAULT false,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_promotions_plan
          FOREIGN KEY (financing_plan_id)
          REFERENCES "FINANCING_PLANS"(financing_plan_id)
          ON DELETE RESTRICT,
        CONSTRAINT chk_promotion_installments
          CHECK (installments_count IS NULL OR installments_count > 0),
        CONSTRAINT chk_promotion_profit
          CHECK (profit_percentage IS NULL OR (profit_percentage >= 0 AND profit_percentage <= 1))
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_promotions_society
      ON "PROMOTIONS" (society_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_promotions_plan
      ON "PROMOTIONS" (financing_plan_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_promotions_active
      ON "PROMOTIONS" (society_id, is_active);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_promotions_society_name
      ON "PROMOTIONS" (society_id, lower(name));
    `);

    await queryRunner.query(`
      CREATE TABLE "PROMOTION_PRODUCTS" (
        promotion_id uuid NOT NULL,
        product_id uuid NOT NULL,
        PRIMARY KEY (promotion_id, product_id),
        CONSTRAINT fk_promotion_products_promotion
          FOREIGN KEY (promotion_id)
          REFERENCES "PROMOTIONS"(promotion_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_promotion_products_product
          FOREIGN KEY (product_id)
          REFERENCES "PRODUCTS"(product_id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_promotion_products_product
      ON "PROMOTION_PRODUCTS" (product_id);
    `);

    // Snapshot de la selección comercial aplicada a una venta.
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD COLUMN IF NOT EXISTS financing_plan_id uuid,
        ADD COLUMN IF NOT EXISTS promotion_id uuid;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_financing_plan
      ON "SALES" (financing_plan_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_promotion
      ON "SALES" (promotion_id);
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD CONSTRAINT fk_sales_financing_plan
        FOREIGN KEY (financing_plan_id)
        REFERENCES "FINANCING_PLANS"(financing_plan_id)
        ON DELETE RESTRICT;
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
        ADD CONSTRAINT fk_sales_promotion
        FOREIGN KEY (promotion_id)
        REFERENCES "PROMOTIONS"(promotion_id)
        ON DELETE RESTRICT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        DROP CONSTRAINT IF EXISTS fk_sales_promotion;
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
        DROP CONSTRAINT IF EXISTS fk_sales_financing_plan;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_sales_promotion;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_sales_financing_plan;
    `);

    await queryRunner.query(`
      ALTER TABLE "SALES"
        DROP COLUMN IF EXISTS promotion_id,
        DROP COLUMN IF EXISTS financing_plan_id;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "PROMOTION_PRODUCTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "PROMOTIONS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "FINANCING_PLAN_PRODUCTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "FINANCING_PLANS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "FINANCING_CONFIG_PRODUCTS";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "FINANCING_CONFIGURATIONS";`);
  }
}
