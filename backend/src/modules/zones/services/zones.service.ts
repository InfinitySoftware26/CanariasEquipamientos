import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  IZonesRepository,
  ZONES_REPOSITORY,
} from "../interfaces/zones-repository.interface";
import {
  IStaffZonesRepository,
  STAFF_ZONES_REPOSITORY,
} from "../interfaces/staff-zones-repository.interface";
import { CreateZoneDto } from "../dto/create-zone.dto";
import { UpdateZoneDto } from "../dto/update-zone.dto";
import { AssignStaffZoneDto } from "../dto/assign-staff-zone.dto";
import { Zone, ZoneStatus } from "../entities/zone.entity";
import { StaffZoneStatus } from "../entities/staff-zone.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { StaffRole } from "../../../common/enums/staff-role.enum";

const ASSIGNABLE_ROLES: StaffRole[] = [StaffRole.SELLER, StaffRole.COLLECTOR];

@Injectable()
export class ZonesService {
  constructor(
    @Inject(ZONES_REPOSITORY)
    private readonly zonesRepo: IZonesRepository,
    @Inject(STAFF_ZONES_REPOSITORY)
    private readonly staffZonesRepo: IStaffZonesRepository,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  findBySociety(societyId: string): Promise<Zone[]> {
    return this.zonesRepo.findBySociety(societyId);
  }

  async findById(id: string, societyId: string): Promise<Zone> {
    console.log("ZONE ID:", id);
    console.log("SOCIETY:", societyId);

    const zone = await this.zonesRepo.findById(id);
    if (!zone || zone.societyId !== societyId)
      throw new NotFoundException("Zona " + id + " no encontrada");
    return zone;
  }

  async create(dto: CreateZoneDto, societyId: string): Promise<Zone> {
    await this.assertUniqueNameInSociety(dto.name, societyId);
    return this.zonesRepo.create({ ...dto, societyId });
  }

  async update(
    id: string,
    dto: UpdateZoneDto,
    societyId: string,
  ): Promise<Zone> {
    await this.findById(id, societyId);
    if (dto.name) await this.assertUniqueNameInSociety(dto.name, societyId, id);
    return this.zonesRepo.update(id, dto);
  }

  async deactivate(id: string, societyId: string): Promise<void> {
    const zone = await this.findById(id, societyId);
    if (zone.status === ZoneStatus.INACTIVE)
      throw new BadRequestException("La zona ya está inactiva");
    await this.zonesRepo.softDelete(id);
  }

  async getZoneStaff(zoneId: string, societyId: string): Promise<any[]> {
    await this.findById(zoneId, societyId);
    return this.staffZonesRepo.findByZone(zoneId);
  }

  async assignStaff(
    zoneId: string,
    dto: AssignStaffZoneDto,
    societyId: string,
  ): Promise<void> {
    await this.findById(zoneId, societyId);
    await this.assertCanAssignStaff(dto.staffId);
    await this.staffZonesRepo.assign(
      dto.staffId,
      zoneId,
      dto.status ?? StaffZoneStatus.ACTIVE,
    );
  }

  async unassignStaff(
    zoneId: string,
    staffId: string,
    societyId: string,
  ): Promise<void> {
    await this.findById(zoneId, societyId);
    await this.staffZonesRepo.unassign(staffId, zoneId);
  }

  private async assertUniqueNameInSociety(
    name: string,
    societyId: string,
    excludeZoneId?: string,
  ): Promise<void> {
    const existing = await this.zonesRepo.findByNameAndSociety(name, societyId);
    if (existing && existing.zoneId !== excludeZoneId)
      throw new ConflictException(
        'Ya existe una zona con el nombre "' + name + '" en esta sociedad',
      );
  }

  private async assertCanAssignStaff(staffId: string): Promise<void> {
    const staff = await this.staffRepo.findOne({ where: { staffId } });
    if (!staff)
      throw new NotFoundException("Empleado " + staffId + " no encontrado");
    if (!ASSIGNABLE_ROLES.includes(staff.role))
      throw new BadRequestException(
        "Solo se pueden asignar vendedores y cobradores a zonas",
      );
  }
}
