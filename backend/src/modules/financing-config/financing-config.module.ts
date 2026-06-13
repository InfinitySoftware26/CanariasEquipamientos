import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancingConfigController } from './controllers/financing-config.controller';
import { FinancingConfigService } from './services/financing-config.service';
import { FinancingConfigRepository } from './repositories/financing-config.repository';
import { FinancingConfiguration } from './entities/financing-configuration.entity';
import { FINANCING_CONFIG_REPOSITORY } from './interfaces/financing-config-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FinancingConfiguration])],
  controllers: [FinancingConfigController],
  providers: [
    FinancingConfigService,
    { provide: FINANCING_CONFIG_REPOSITORY, useClass: FinancingConfigRepository },
  ],
  exports: [FinancingConfigService],
})
export class FinancingConfigModule {}
