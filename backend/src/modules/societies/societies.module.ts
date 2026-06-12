import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocietiesController } from './controllers/societies.controller';
import { SocietiesService } from './services/societies.service';
import { SocietiesRepository } from './repositories/societies.repository';
import { StaffSocietiesRepository } from './repositories/staff-societies.repository';
import { Society } from './entities/society.entity';
import { StaffSociety } from './entities/staff-society.entity';
import { SOCIETIES_REPOSITORY } from './interfaces/societies-repository.interface';
import { STAFF_SOCIETIES_REPOSITORY } from './interfaces/staff-societies-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Society, StaffSociety])],
  controllers: [SocietiesController],
  providers: [
    SocietiesService,
    { provide: SOCIETIES_REPOSITORY, useClass: SocietiesRepository },
    { provide: STAFF_SOCIETIES_REPOSITORY, useClass: StaffSocietiesRepository },
  ],
  exports: [SocietiesService],
})
export class SocietiesModule {}
