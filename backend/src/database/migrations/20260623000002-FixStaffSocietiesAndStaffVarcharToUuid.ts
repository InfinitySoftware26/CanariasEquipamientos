import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixStaffSocietiesAndStaffVarcharToUuid20260623000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('[MIGRATION] FixStaffSocietiesAndStaffVarcharToUuid — start');

    // ── STAFF_SOCIETIES ──────────────────────────────────────────────────────
    const staffSocietiesCols = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'STAFF_SOCIETIES'
        AND column_name IN ('staff_id', 'society_id')
        AND data_type = 'character varying'
    `);

    if (staffSocietiesCols.length > 0) {
      console.log('[MIGRATION] STAFF_SOCIETIES — converting:', staffSocietiesCols.map((r: any) => r.column_name));
      await queryRunner.query(`
        ALTER TABLE "STAFF_SOCIETIES"
          ALTER COLUMN staff_id   TYPE uuid USING staff_id::uuid,
          ALTER COLUMN society_id TYPE uuid USING society_id::uuid
      `);
      console.log('[MIGRATION] STAFF_SOCIETIES — done');
    } else {
      console.log('[MIGRATION] STAFF_SOCIETIES — already uuid, skipping');
    }

    // ── STAFF ────────────────────────────────────────────────────────────────
    const staffCols = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'STAFF'
        AND column_name = 'society_id'
        AND data_type = 'character varying'
    `);

    if (staffCols.length > 0) {
      console.log('[MIGRATION] STAFF — converting: society_id');
      await queryRunner.query(`
        ALTER TABLE "STAFF"
          ALTER COLUMN society_id TYPE uuid USING society_id::uuid
      `);
      console.log('[MIGRATION] STAFF — done');
    } else {
      console.log('[MIGRATION] STAFF — already uuid, skipping');
    }

    // ── STAFF_ZONES ──────────────────────────────────────────────────────────
    const staffZonesCols = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'STAFF_ZONES'
        AND column_name IN ('staff_id', 'zone_id')
        AND data_type = 'character varying'
    `);

    if (staffZonesCols.length > 0) {
      console.log('[MIGRATION] STAFF_ZONES — converting:', staffZonesCols.map((r: any) => r.column_name));
      await queryRunner.query(`
        ALTER TABLE "STAFF_ZONES"
          ALTER COLUMN staff_id TYPE uuid USING staff_id::uuid,
          ALTER COLUMN zone_id  TYPE uuid USING zone_id::uuid
      `);
      console.log('[MIGRATION] STAFF_ZONES — done');
    } else {
      console.log('[MIGRATION] STAFF_ZONES — already uuid, skipping');
    }

    console.log('[MIGRATION] FixStaffSocietiesAndStaffVarcharToUuid — complete');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "STAFF_ZONES"
        ALTER COLUMN staff_id TYPE character varying USING staff_id::text,
        ALTER COLUMN zone_id  TYPE character varying USING zone_id::text
    `);

    await queryRunner.query(`
      ALTER TABLE "STAFF"
        ALTER COLUMN society_id TYPE character varying USING society_id::text
    `);

    await queryRunner.query(`
      ALTER TABLE "STAFF_SOCIETIES"
        ALTER COLUMN staff_id   TYPE character varying USING staff_id::text,
        ALTER COLUMN society_id TYPE character varying USING society_id::text
    `);
  }
}
