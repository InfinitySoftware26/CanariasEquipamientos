import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner, Brackets } from "typeorm";
import { Staff } from "../entities/staff.entity";
import { IStaffRepository } from "../interfaces/staff-repository.interface";
import { StaffSocietyStatus } from "../../societies/entities/staff-society.entity";

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(
    @InjectRepository(Staff)
    private readonly repo: Repository<Staff>
  ) {}

  findAll(societyId: string): Promise<Staff[]> {
    return this.repo.find({
      where: { primarySocietyId: societyId, isActive: true },
      order: { name: "ASC" },
    });
  }

  findById(id: string, societyId?: string): Promise<Staff | null> {
    if (societyId === undefined) {
      return this.repo.findOne({ where: { staffId: id } });
    }
    // Pertenencia: sociedad primaria (STAFF.society_id) o asignación activa en
    // STAFF_SOCIETIES — el mismo vínculo que habilita select-society.
    return this.repo
      .createQueryBuilder("staff")
      .where("staff.staffId = :id", { id })
      .andWhere(
        new Brackets((b) =>
          b
            .where("staff.primarySocietyId = :societyId", { societyId })
            .orWhere(
              `EXISTS (SELECT 1 FROM "STAFF_SOCIETIES" ss
                        WHERE ss.staff_id = staff.staff_id
                          AND ss.society_id = :societyId
                          AND ss.status = :activeStatus)`,
              { activeStatus: StaffSocietyStatus.ACTIVE },
            ),
        ),
      )
      .getOne();
  }

  findByEmail(email: string): Promise<Staff | null> {
    return this.repo.findOne({ where: { email } });
  }

  findByDni(dni: string): Promise<Staff | null> {
    return this.repo.findOne({ where: { dni } });
  }

  findByEmailWithPassword(email: string): Promise<Staff | null> {
    return this.repo
      .createQueryBuilder("staff")
      .addSelect("staff.passwordHash")
      .where("staff.email = :email AND staff.isActive = true", { email })
      .getOne();
  }

  async create(data: Partial<Staff>, qr?: QueryRunner): Promise<Staff> {
    const r = qr ? qr.manager.getRepository(Staff) : this.repo;
    return r.save(r.create(data));
  }

  async update(
    id: string,
    data: Partial<Staff>,
    qr?: QueryRunner
  ): Promise<Staff> {
    const r = qr ? qr.manager.getRepository(Staff) : this.repo;
    await r.update({ staffId: id }, data);
    const updated = await r.findOne({ where: { staffId: id } });
    if (!updated) throw new NotFoundException("Empleado no encontrado");
    return updated;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repo.update({ staffId: id }, { passwordHash });
  }
}
