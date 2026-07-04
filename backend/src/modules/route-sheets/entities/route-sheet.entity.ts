import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { RouteSheetStatus } from '../../../common/enums/route-sheet-status.enum';

@Entity('ROUTE_SHEETS')
export class RouteSheet {
  @PrimaryGeneratedColumn('uuid', { name: 'route_sheet_id' })
  routeSheetId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'zone_id', type: 'uuid' })
  zoneId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy!: string;

  @Column({ name: 'route_date', type: 'date' })
  routeDate!: Date;

  @Column({ type: 'enum', enum: RouteSheetStatus, default: RouteSheetStatus.PENDING })
  status!: RouteSheetStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
