import { Staff } from "../entities/staff.entity";
import { QueryRunner } from "typeorm";

export interface IStaffRepository {
  findAll(societyId: string): Promise<Staff[]>;
  findById(id: string): Promise<Staff | null>;
  findByEmail(email: string): Promise<Staff | null>;
  findByDni(dni: string): Promise<Staff | null>;
  findByEmailWithPassword(email: string): Promise<Staff | null>;
  create(data: Partial<Staff>, qr?: QueryRunner): Promise<Staff>;
  update(id: string, data: Partial<Staff>, qr?: QueryRunner): Promise<Staff>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

export const STAFF_REPOSITORY = "IStaffRepository";
