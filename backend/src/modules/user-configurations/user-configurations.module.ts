import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConfigurationsController } from './controllers/user-configurations.controller';
import { UserConfigurationsService } from './services/user-configurations.service';
import { UserConfigurationsRepository } from './repositories/user-configurations.repository';
import { UserConfiguration } from './entities/user-configuration.entity';
import { USER_CONFIGURATIONS_REPOSITORY } from './interfaces/user-configurations-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserConfiguration])],
  controllers: [UserConfigurationsController],
  providers: [
    UserConfigurationsService,
    { provide: USER_CONFIGURATIONS_REPOSITORY, useClass: UserConfigurationsRepository },
  ],
  exports: [UserConfigurationsService],
})
export class UserConfigurationsModule {}
