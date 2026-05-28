import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Staff } from "./entities/staff.entity";
import { StaffController } from "./controllers/staff.controller";
import { StaffService } from "./services/staff.service";
import { StaffRepository } from "./repositories/staff.repository";
import { STAFF_REPOSITORY } from "./interfaces/staff-repository.interface";

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  controllers: [StaffController],
  providers: [
    StaffService,
    { provide: STAFF_REPOSITORY, useClass: StaffRepository },
  ],
  exports: [StaffService],
})
export class StaffModule {}
