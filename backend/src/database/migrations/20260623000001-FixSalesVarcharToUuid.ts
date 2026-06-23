import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * La tabla SALES fue creada originalmente por synchronize:true cuando las
 * entidades no tenían type:'uuid' en los @Column de client_id, staff_id y
 * society_id. PostgreSQL los creó como character varying. Ahora que las
 * entidades declaran type:'uuid', TypeORM vincula los parámetros como uuid
 * y PostgreSQL rechaza la comparación uuid = character varying.
 *
 * Esta migration convierte esas tres columnas a uuid usando USING ::uuid.
 * El cast es seguro siempre que todos los valores almacenados sean UUID válidos.
 */
export class FixSalesVarcharToUuid20260623000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ALTER COLUMN client_id   TYPE uuid USING client_id::uuid,
        ALTER COLUMN staff_id    TYPE uuid USING staff_id::uuid,
        ALTER COLUMN society_id  TYPE uuid USING society_id::uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "SALES"
        ALTER COLUMN client_id   TYPE character varying USING client_id::text,
        ALTER COLUMN staff_id    TYPE character varying USING staff_id::text,
        ALTER COLUMN society_id  TYPE character varying USING society_id::text;
    `);
  }
}
