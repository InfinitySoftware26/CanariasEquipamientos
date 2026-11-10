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
import { JwtPayload } from "../../../common/interfaces/jwt-payload.interface";
import { SocietiesService } from "../../societies/services/societies.service";
import { societyScopeOf } from "../../../common/utils/society-scope.util";

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

/**
 * Jerarquía para editar/desactivar: un actor solo opera sobre rangos
 * estrictamente menores. SELLER y COLLECTOR comparten el rango más bajo.
 */
const ROLE_RANK: Readonly<Record<StaffRole, number>> = {
  [StaffRole.SUPER_ADMIN]: 4,
  [StaffRole.MANAGER]: 3,
  [StaffRole.ADMIN]: 2,
  [StaffRole.SELLER]: 1,
  [StaffRole.COLLECTOR]: 1,
};

/** Campos que cada empleado puede editar sobre sí mismo. */
const SELF_EDITABLE_FIELDS: ReadonlyArray<keyof UpdateStaffDto> = [
  "name",
  "phone",
  "address",
];

@Injectable()
export class StaffService {
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: IStaffRepository,
    private readonly societiesService: SocietiesService,
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  findAll(societyId: string): Promise<Staff[]> {
    return this.staffRepo.findAll(societyId);
  }

  /**
   * societyId opcional: si se pasa, un empleado que no pertenece a esa
   * sociedad responde 404 (ver StaffRepository.findById).
   */
  async findById(id: string, societyId?: string): Promise<Staff> {
    const staff = await this.staffRepo.findById(id, societyId);
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

  async lookup(
    currentSocietyId: string,
    email?: string,
    dni?: string,
  ): Promise<(Staff & { alreadyInCurrentSociety: boolean }) | null> {
    if (!email && !dni) return null;

    const found = email
      ? await this.staffRepo.findByEmail(email)
      : await this.staffRepo.findByDni(dni!);

    if (!found) return null;

    const societies = await this.societiesService.getSocietiesForStaff(
      found.staffId,
    );
    const alreadyInCurrentSociety = societies.some(
      (s) => s.societyId === currentSocietyId,
    );

    return { ...found, alreadyInCurrentSociety };
  }

  // ─── COMMANDS ─────────────────────────────────────────────────────────────

  /**
   * Crea un empleado con rol asignable (MANAGER, ADMIN, SELLER, COLLECTOR).
   * El rol SUPER_ADMIN no puede ser enviado por este metodo.
   */
  async create(dto: CreateStaffDto, currentUser: JwtPayload): Promise<Staff> {
    this.assertCanCreateRole(
      currentUser.role,
      dto.role as unknown as StaffRole,
    );
    await this.assertUniqueEmailAndDni(dto.email, dto.dni);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // SUPER_ADMIN puede asignar a cualquier sociedad; los demás roles solo
    // pueden crear staff en su propia sociedad (ignoramos dto.societyId)
    const primarySocietyId =
      currentUser.role === StaffRole.SUPER_ADMIN
        ? dto.societyId
        : currentUser.societyId;

    const staff = await this.staffRepo.create({
      name: dto.name,
      dni: dto.dni,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role as unknown as StaffRole,
      primarySocietyId,
      isActive: true,
    });

    if (primarySocietyId) {
      await this.societiesService.linkStaffToSociety(
        staff.staffId,
        primarySocietyId,
      );
    }

    return staff;
  }

  /**
   * Crea un SUPER_ADMIN.
   * Solo accesible por otro SUPER_ADMIN via POST /staff/super-admin.
   */
  async createSuperAdmin(
    dto: CreateSuperAdminDto,
    currentUser: JwtPayload,
  ): Promise<Staff> {
    this.assertCanCreateRole(currentUser.role, StaffRole.SUPER_ADMIN);
    await this.assertUniqueEmailAndDni(dto.email, dto.dni);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.staffRepo.create({
      name: dto.name,
      dni: dto.dni,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: StaffRole.SUPER_ADMIN,
      primarySocietyId: dto.societyId ?? undefined,
      isActive: true,
    });
  }

  async update(
    id: string,
    dto: UpdateStaffDto,
    currentUser: JwtPayload,
  ): Promise<Staff> {
    await this.assertCanUpdate(id, dto, currentUser);
    const { role, ...rest } = dto;
    const changes: Partial<Staff> = { ...rest };
    // AssignableRole y StaffRole comparten valores; SUPER_ADMIN ya está excluido por el DTO.
    if (role !== undefined) changes.role = role as unknown as StaffRole;
    return this.staffRepo.update(id, changes);
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
    currentUser: JwtPayload,
  ): Promise<void> {
    if (currentUser.sub !== id) {
      throw new ForbiddenException("Solo puedes cambiar tu propia contrasena");
    }

    const staff = await this.staffRepo.findByEmailWithPassword(
      (await this.findById(id)).email,
    );
    if (!staff) throw new NotFoundException("Empleado no encontrado");

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      staff.passwordHash,
    );
    if (!isMatch)
      throw new UnauthorizedException("La contrasena actual es incorrecta");

    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.staffRepo.updatePassword(id, newHash);
  }

  /**
   * Nadie se desactiva a sí mismo; solo se desactivan roles estrictamente
   * inferiores (SUPER_ADMIN exento). 404 si el empleado es de otra sociedad.
   */
  async deactivate(id: string, currentUser: JwtPayload): Promise<void> {
    const target = await this.findById(id, societyScopeOf(currentUser));
    if (currentUser.sub === id) {
      throw new ForbiddenException("No podés desactivarte a vos mismo");
    }
    this.assertOutranks(currentUser.role, target.role);
    await this.staffRepo.update(id, { isActive: false });
  }

  // ─── GUARDS DE NEGOCIO ────────────────────────────────────────────────────

  private assertCanCreateRole(
    creatorRole: StaffRole,
    targetRole: StaffRole,
  ): void {
    const allowed = CREATION_PERMISSIONS[creatorRole] ?? [];
    if (!allowed.includes(targetRole)) {
      throw new ForbiddenException(
        "No tienes permiso para crear usuarios con el rol " + targetRole,
      );
    }
  }

  private async assertUniqueEmailAndDni(
    email: string,
    dni: string,
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

  /**
   * Reglas de edición (PATCH /staff/:id):
   * - Sobre sí mismo: solo datos no sensibles (SELF_EDITABLE_FIELDS). Nadie,
   *   ni SUPER_ADMIN, cambia su propio rol ni su propio isActive.
   * - Sobre otro: el destino debe tener rol estrictamente inferior al del
   *   actor (SUPER_ADMIN exento) y el rol nuevo debe estar en
   *   CREATION_PERMISSIONS del actor.
   * El destino se busca con la sociedad del actor (404 si es de otra).
   */
  private async assertCanUpdate(
    targetId: string,
    dto: UpdateStaffDto,
    currentUser: JwtPayload,
  ): Promise<void> {
    const target = await this.findById(targetId, societyScopeOf(currentUser));

    if (currentUser.sub === targetId) {
      const forbidden = Object.keys(dto).filter(
        (k) =>
          (dto as Record<string, unknown>)[k] !== undefined &&
          !SELF_EDITABLE_FIELDS.includes(k as keyof UpdateStaffDto),
      );
      if (forbidden.length > 0) {
        throw new ForbiddenException(
          "Solo podés editar tus datos personales (" +
            SELF_EDITABLE_FIELDS.join(", ") +
            "). No podés modificar: " +
            forbidden.join(", "),
        );
      }
      return;
    }

    this.assertOutranks(currentUser.role, target.role);

    if (dto.role !== undefined) {
      this.assertCanCreateRole(currentUser.role, dto.role as unknown as StaffRole);
    }
  }

  /** SUPER_ADMIN exento; el resto solo actúa sobre roles estrictamente inferiores. */
  private assertOutranks(actorRole: StaffRole, targetRole: StaffRole): void {
    if (actorRole === StaffRole.SUPER_ADMIN) return;
    if (ROLE_RANK[targetRole] >= ROLE_RANK[actorRole]) {
      throw new ForbiddenException(
        "Solo podés modificar empleados con un rol inferior al tuyo",
      );
    }
  }
}
