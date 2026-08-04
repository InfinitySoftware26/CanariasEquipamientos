import { Injectable, Inject } from '@nestjs/common';
import {
  IUserConfigurationsRepository, USER_CONFIGURATIONS_REPOSITORY,
} from '../interfaces/user-configurations-repository.interface';
import { UserConfiguration } from '../entities/user-configuration.entity';
import { UpdateUserConfigurationDto } from '../dto/update-user-configuration.dto';

@Injectable()
export class UserConfigurationsService {
  constructor(
    @Inject(USER_CONFIGURATIONS_REPOSITORY)
    private readonly userConfigurationsRepo: IUserConfigurationsRepository,
  ) {}

  async findForStaff(staffId: string): Promise<UserConfiguration> {
    const existing = await this.userConfigurationsRepo.findByStaff(staffId);
    if (existing) return existing;

    return this.userConfigurationsRepo.create({
      staffId,
      dashboardPreferences: {},
      theme: 'light',
      notificationPreferences: {},
    });
  }

  async update(staffId: string, dto: UpdateUserConfigurationDto): Promise<UserConfiguration> {
    await this.findForStaff(staffId);
    await this.userConfigurationsRepo.update(staffId, dto);
    return this.findForStaff(staffId);
  }
}
