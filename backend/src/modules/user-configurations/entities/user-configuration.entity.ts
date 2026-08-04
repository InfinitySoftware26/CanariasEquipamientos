import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('USER_CONFIGURATIONS')
export class UserConfiguration {
  @PrimaryGeneratedColumn('uuid', { name: 'user_configuration_id' })
  userConfigurationId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ name: 'dashboard_preferences', type: 'jsonb', default: {} })
  dashboardPreferences!: Record<string, unknown>;

  @Column({ default: 'light' })
  theme!: string;

  @Column({ name: 'notification_preferences', type: 'jsonb', default: {} })
  notificationPreferences!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
