import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientReferenceFields20260705000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "CLIENT"
        ADD COLUMN IF NOT EXISTS name_reference1 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS tel_reference1 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS address_reference1 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS name_reference2 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS tel_reference2 text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS address_reference2 text NOT NULL DEFAULT '';
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "CLIENT"
        DROP COLUMN IF EXISTS address_reference2,
        DROP COLUMN IF EXISTS tel_reference2,
        DROP COLUMN IF EXISTS name_reference2,
        DROP COLUMN IF EXISTS address_reference1,
        DROP COLUMN IF EXISTS tel_reference1,
        DROP COLUMN IF EXISTS name_reference1;
    `);
    }
}
