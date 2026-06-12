import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum StaffZoneStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}

@Entity('STAFF_ZONES')
export class StaffZone {
  @PrimaryGeneratedColumn('uuid', { name: 'staff_zone_id' })
  staffZoneId!: string;

  @Column({ name: 'staff_id' })
  staffId!: string;

  @Column({ name: 'zone_id' })
  zoneId!: string;

  @Column({ type: 'enum', enum: StaffZoneStatus, default: StaffZoneStatus.ACTIVE })
  status!: StaffZoneStatus;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt!: Date;
}
