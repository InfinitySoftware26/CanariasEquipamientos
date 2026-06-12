import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonesController } from './controllers/zones.controller';
import { ZonesService } from './services/zones.service';
import { ZonesRepository } from './repositories/zones.repository';
import { StaffZonesRepository } from './repositories/staff-zones.repository';
import { Zone } from './entities/zone.entity';
import { StaffZone } from './entities/staff-zone.entity';
import { Staff } from '../staff/entities/staff.entity';
import { ZONES_REPOSITORY } from './interfaces/zones-repository.interface';
import { STAFF_ZONES_REPOSITORY } from './interfaces/staff-zones-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, StaffZone, Staff])],
  controllers: [ZonesController],
  providers: [
    ZonesService,
    { provide: ZONES_REPOSITORY, useClass: ZonesRepository },
    { provide: STAFF_ZONES_REPOSITORY, useClass: StaffZonesRepository },
  ],
  exports: [ZonesService],
})
export class ZonesModule {}
