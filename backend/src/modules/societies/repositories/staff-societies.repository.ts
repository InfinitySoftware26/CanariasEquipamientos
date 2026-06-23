import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  StaffSociety,
  StaffSocietyStatus,
} from "../entities/staff-society.entity";
import { IStaffSocietiesRepository } from "../interfaces/staff-societies-repository.interface";

@Injectable()
export class StaffSocietiesRepository implements IStaffSocietiesRepository {
  constructor(
    @InjectRepository(StaffSociety)
    private readonly repo: Repository<StaffSociety>,
  ) {}

  findBySocietyWithStaff(societyId: string): Promise<any[]> {
    return this.repo.manager
      .createQueryBuilder()
      .select("s.staff_id", "staffId")
      .addSelect("s.name", "name")
      .addSelect("s.email", "email")
      .addSelect("s.role", "role")
      .addSelect("ss.status", "status")
      .addSelect("ss.assigned_at", "assignedAt")
      .from("STAFF_SOCIETIES", "ss")
      .innerJoin("STAFF", "s", "s.staff_id = ss.staff_id")
      .where("ss.society_id = :societyId", { societyId })
      .orderBy("s.name", "ASC")
      .getRawMany();
  }

  findByStaff(
    staffId: string,
  ): Promise<{ societyId: string; societyName: string; status: string }[]> {
    return this.repo.manager
      .createQueryBuilder()
      .select("ss.society_id", "societyId")
      .addSelect("s.name", "societyName")
      .addSelect("ss.status", "status")
      .from("STAFF_SOCIETIES", "ss")
      .innerJoin("SOCIETYS", "s", "s.society_id = ss.society_id")
      .where("ss.staff_id = :staffId", { staffId })
      .andWhere("ss.status = :status", { status: "active" })
      .orderBy("s.name", "ASC")
      .getRawMany();
  }

  async upsert(
    staffId: string,
    societyId: string,
    status: StaffSocietyStatus,
  ): Promise<void> {
    const existing = await this.repo.findOne({ where: { staffId, societyId } });
    if (existing) {
      await this.repo.update(
        { staffSocietyId: existing.staffSocietyId },
        { status },
      );
    } else {
      await this.repo.save(this.repo.create({ staffId, societyId, status }));
    }
  }
}
