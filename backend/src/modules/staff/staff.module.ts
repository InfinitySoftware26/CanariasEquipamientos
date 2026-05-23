import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffService } from './services/staff.service';

@Module({
  imports:   [TypeOrmModule.forFeature([Staff])],
  providers: [StaffService],
  exports:   [StaffService],
})
export class StaffModule {}
