import { UserConfiguration } from '../entities/user-configuration.entity';

export interface IUserConfigurationsRepository {
  findByStaff(staffId: string): Promise<UserConfiguration | null>;
  create(data: Partial<UserConfiguration>): Promise<UserConfiguration>;
  update(staffId: string, data: Partial<UserConfiguration>): Promise<void>;
}

export const USER_CONFIGURATIONS_REPOSITORY = 'IUserConfigurationsRepository';
