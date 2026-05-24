import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocietiesController } from './controllers/societies.controller';
import { SocietiesService } from './services/societies.service';
import { SocietiesRepository } from './repositories/societies.repository';
import { Society } from './entities/society.entity';
import { SOCIETIES_REPOSITORY } from './interfaces/societies-repository.interface';

@Module({
  imports:     [TypeOrmModule.forFeature([Society])],
  controllers: [SocietiesController],
  providers:   [
    SocietiesService,
    { provide: SOCIETIES_REPOSITORY, useClass: SocietiesRepository },
  ],
  exports: [SocietiesService],
})
export class SocietiesModule {}
