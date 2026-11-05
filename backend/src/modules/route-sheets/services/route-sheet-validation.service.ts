import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { Staff } from "../../staff/entities/staff.entity";
import {
  StaffZone,
  StaffZoneStatus,
} from "../../zones/entities/staff-zone.entity";
import { Zone } from "../../zones/entities/zone.entity";

@Injectable()
export class RouteSheetValidationService {
  constructor(
    @InjectRepository(Zone) private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(StaffZone)
    private readonly staffZoneRepo: Repository<StaffZone>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
  ) {}

  // ============================================================
  // VALIDAR ZONA Y COBRADOR
  // ============================================================

  async validateZoneAndCollector(
    societyId: string,
    zoneId: string,
    staffId: string,
  ) {
    const zone = await this.zoneRepo.findOne({
      where: {
        zoneId,
      },
    });

    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${zoneId} no encontrada`);
    }

    const staff = await this.staffRepo.findOne({
      where: {
        staffId,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Empleado ${staffId} no encontrado`);
    }

    if (staff.role !== StaffRole.COLLECTOR) {
      throw new BadRequestException(
        "El empleado seleccionado no es un cobrador",
      );
    }

    if (staff.primarySocietyId !== societyId) {
      throw new ForbiddenException("El cobrador no pertenece a esta sociedad");
    }

    const staffZone = await this.staffZoneRepo.findOne({
      where: {
        staffId,

        zoneId,

        status: StaffZoneStatus.ACTIVE,
      },
    });

    if (!staffZone) {
      throw new BadRequestException("El cobrador no está asignado a esta zona");
    }
  }
}
