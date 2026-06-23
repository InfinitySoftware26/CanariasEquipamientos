import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureSalesUuidColumns20260624000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('[MIGRATION] EnsureSalesUuidColumns — checking SALES column types...');

    const varcharCols = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'SALES'
        AND column_name IN ('client_id', 'staff_id', 'society_id')
        AND data_type = 'character varying'
    `);

    if (varcharCols.length === 0) {
      console.log('[MIGRATION] EnsureSalesUuidColumns — all columns already uuid, skipping.');
      return;
    }

    console.log(
      '[MIGRATION] EnsureSalesUuidColumns — converting varchar columns to uuid:',
      varcharCols.map((r: any) => r.column_name),
    );

    await queryRunner.query(`
      ALTER TABLE "SALES"
        ALTER COLUMN client_id  TYPE uuid USING client_id::uuid,
        ALTER COLUMN staff_id   TYPE uuid USING staff_id::uuid,
        ALTER COLUMN society_id TYPE uuid USING society_id::uuid
    `);

    console.log('[MIGRATION] EnsureSalesUuidColumns — done.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ALTER COLUMN client_id  TYPE character varying USING client_id::text,
        ALTER COLUMN staff_id   TYPE character varying USING staff_id::text,
        ALTER COLUMN society_id TYPE character varying USING society_id::text
    `);
  }
}
