import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { StaffRole } from '../../../common/enums/staff-role.enum';

@Entity('STAFF')
export class Staff {
  @PrimaryGeneratedColumn('uuid', { name: 'staff_id' })
  staffId!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  dni!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash!: string;

  @Column({ type: 'enum', enum: StaffRole })
  role!: StaffRole;

  @Column({ name: 'society_id', nullable: true })
  primarySocietyId!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
