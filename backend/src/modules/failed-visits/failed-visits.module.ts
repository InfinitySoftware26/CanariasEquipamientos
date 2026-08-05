import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailedVisitsController } from './controllers/failed-visits.controller';
import { FailedVisitsService } from './services/failed-visits.service';
import { FailedVisitsRepository } from './repositories/failed-visits.repository';
import { FailedVisit } from './entities/failed-visit.entity';
import { FAILED_VISITS_REPOSITORY } from './interfaces/failed-visits-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FailedVisit])],
  controllers: [FailedVisitsController],
  providers: [
    FailedVisitsService,
    { provide: FAILED_VISITS_REPOSITORY, useClass: FailedVisitsRepository },
  ],
  exports: [FailedVisitsService],
})
export class FailedVisitsModule {}
