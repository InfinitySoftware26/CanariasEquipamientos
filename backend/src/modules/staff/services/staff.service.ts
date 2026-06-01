import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  IStaffRepository,
  STAFF_REPOSITORY,
} from "../interfaces/staff-repository.interface";
import { CreateStaffDto } from "../dto/create-staff.dto";
import { CreateSuperAdminDto } from "../dto/create-super-admin.dto";
import { UpdateStaffDto } from "../dto/update-staff.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { Staff } from "../entities/staff.entity";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { AssignableRole } from "../../../common/enums/assignable-role.enum";
import { JwtPayload } from "../../../common/interfaces/jwt-payload.interface";

const SALT_ROUNDS = 12;

/**
 * Mapa de permisos de creacion por rol.
 * SUPER_ADMIN puede crear cualquier rol incluyendo otro SUPER_ADMIN
 * (via endpoint exclusivo POST /staff/super-admin).
 * OCP: agregar un nuevo rol solo requiere actualizar este mapa.
 */
const CREATION_PERMISSIONS: Readonly<Record<string, StaffRole[]>> = {
  [StaffRole.SUPER_ADMIN]: [
    StaffRole.SUPER_ADMIN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],
  [StaffRole.MANAGER]: [StaffRole.ADMIN, StaffRole.SELLER, StaffRole.COLLECTOR],
  [StaffRole.ADMIN]: [StaffRole.SELLER, StaffRole.COLLECTOR],
};

@Injectable()
export class StaffService {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  findAll(societyId: string): Promise<Staff[]> {
    return this.staffRepo.findAll(societyId);
  }

  async findById(id: string): Promise<Staff> {
    const staff = await this.staffRepo.findById(id);
    if (!staff)
      throw new NotFoundException("Empleado " + id + " no encontrado");
    return staff;
  }

  getProfile(currentUser: JwtPayload): Promise<Staff> {
    return this.findById(currentUser.sub);
  }

  findByEmailWithPassword(email: string): Promise<Staff | null> {
    return this.staffRepo.findByEmailWithPassword(email);
  }

  // ─── COMMANDS ─────────────────────────────────────────────────────────────

  /**
   * Crea un empleado con rol asignable (MANAGER, ADMIN, SELLER, COLLECTOR).
   * El rol SUPER_ADMIN no puede ser enviado por este metodo.
   */
  async create(dto: CreateStaffDto, currentUser: JwtPayload): Promise<Staff> {
    this.assertCanCreateRole(
      currentUser.role,
      dto.role as unknown as StaffRole
    );
    await this.assertUniqueEmailAndDni(dto.email, dto.dni);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.staffRepo.create({
      name: dto.name,
      dni: dto.dni,
      email: dto.email,
      passwordHash,
      role: dto.role as unknown as StaffRole,
      primarySocietyId: dto.societyId,
      isActive: true,
    });
  }

  /**
   * Crea un SUPER_ADMIN.
   * Solo accesible por otro SUPER_ADMIN via POST /staff/super-admin.
   */
  async createSuperAdmin(
    dto: CreateSuperAdminDto,
    currentUser: JwtPayload
  ): Promise<Staff> {
    this.assertCanCreateRole(currentUser.role, StaffRole.SUPER_ADMIN);
    await this.assertUniqueEmailAndDni(dto.email, dto.dni);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.staffRepo.create({
      name: dto.name,
      dni: dto.dni,
      email: dto.email,
      passwordHash,
      role: StaffRole.SUPER_ADMIN,
      primarySocietyId: dto.societyId ?? undefined,
      isActive: true,
    });
  }

  async update(
    id: string,
    dto: UpdateStaffDto,
    currentUser: JwtPayload
  ): Promise<Staff> {
    await this.findById(id);
    this.assertCanUpdate(id, dto, currentUser);
    return this.staffRepo.update(id, dto);
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
    currentUser: JwtPayload
  ): Promise<void> {
    if (currentUser.sub !== id) {
      throw new ForbiddenException("Solo puedes cambiar tu propia contrasena");
    }

    const staff = await this.staffRepo.findByEmailWithPassword(
      (await this.findById(id)).email
    );
    if (!staff) throw new NotFoundException("Empleado no encontrado");

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      staff.passwordHash
    );
    if (!isMatch)
      throw new UnauthorizedException("La contrasena actual es incorrecta");

    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.staffRepo.updatePassword(id, newHash);
  }

  async deactivate(id: string): Promise<void> {
    await this.findById(id);
    await this.staffRepo.update(id, { isActive: false });
  }

  // ─── GUARDS DE NEGOCIO ────────────────────────────────────────────────────

  private assertCanCreateRole(
    creatorRole: string,
    targetRole: StaffRole
  ): void {
    const allowed = CREATION_PERMISSIONS[creatorRole] ?? [];
    if (!allowed.includes(targetRole)) {
      throw new ForbiddenException(
        "No tienes permiso para crear usuarios con el rol " + targetRole
      );
    }
  }

  private async assertUniqueEmailAndDni(
    email: string,
    dni: string
  ): Promise<void> {
    const [byEmail, byDni] = await Promise.all([
      this.staffRepo.findByEmail(email),
      this.staffRepo.findByDni(dni),
    ]);
    if (byEmail)
      throw new ConflictException("El email " + email + " ya esta registrado");
    if (byDni)
      throw new ConflictException("El DNI " + dni + " ya esta registrado");
  }

  private assertCanUpdate(
    targetId: string,
    dto: UpdateStaffDto,
    currentUser: JwtPayload
  ): void {
    const isSuperAdmin = currentUser.role === StaffRole.SUPER_ADMIN;
    const isManager = currentUser.role === StaffRole.MANAGER;
    const isAdmin = currentUser.role === StaffRole.ADMIN;
    const isSelf = currentUser.sub === targetId;

    if (
      (dto.role !== undefined || dto.isActive !== undefined) &&
      !isSuperAdmin &&
      !isManager
    ) {
      throw new ForbiddenException(
        "Solo el gerente o superadmin puede cambiar el rol o estado"
      );
    }

    if (!isSuperAdmin && !isManager && !isAdmin && !isSelf) {
      throw new ForbiddenException(
        "No tienes permiso para editar este empleado"
      );
    }
  }
}
