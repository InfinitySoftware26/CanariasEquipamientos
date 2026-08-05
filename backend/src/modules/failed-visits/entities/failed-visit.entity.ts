import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { FailedVisitReason } from '../../../common/enums/failed-visit-reason.enum';

@Entity('FAILED_VISITS')
export class FailedVisit {
  @PrimaryGeneratedColumn('uuid', { name: 'failed_visit_id' })
  failedVisitId!: string;

  @Column({ name: 'route_sheet_item_id', type: 'uuid' })
  routeSheetItemId!: string;

  @Column({ name: 'installment_id', type: 'uuid', nullable: true })
  installmentId!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ type: 'enum', enum: FailedVisitReason, default: FailedVisitReason.OTHER })
  reason!: FailedVisitReason;

  @Column({ nullable: true })
  notes!: string;

  @Column({ name: 'attempt_number', type: 'integer' })
  attemptNumber!: number;

  @Column({ name: 'rescheduled_date', type: 'date', nullable: true })
  rescheduledDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
