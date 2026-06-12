import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum ZoneStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}

@Entity('ZONES')
export class Zone {
  @PrimaryGeneratedColumn('uuid', { name: 'zone_id' })
  zoneId!: string;

  @Column({ name: 'society_id' })
  societyId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: ZoneStatus, default: ZoneStatus.ACTIVE })
  status!: ZoneStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
