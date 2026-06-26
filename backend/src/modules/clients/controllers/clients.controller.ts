import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  Query,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ClientsService } from "../services/clients.service";
import { CreateClientDto } from "../dto/create-client.dto";
import { UpdateClientDto } from "../dto/update-client.dto";
import { RequestVerificationDto } from "../dto/request-verification.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { SocietyGuard } from "../../../common/guards/society.guard";

@ApiTags("clients")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post("preload")
  @Roles(
    StaffRole.SELLER,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: "Precargar datos del cliente (vendedor o admin)" })
  preload(@Body() dto: CreateClientDto, @CurrentUser() user: JwtPayload) {
    return this.clientsService.createPreload(dto, {
      staffId: user.sub,
      name: user.email,
      societyId: user.societyId,
    });
  }

  @Get("lookup")
  @Roles(
    StaffRole.SELLER,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({
    summary:
      "Buscar cliente por DNI o email para autocompletado de formularios",
    description:
      "Pasa ?documentNumber=... o ?email=... Devuelve datos + alreadyInCurrentSociety.",
  })
  async lookup(
    @CurrentUser() user: JwtPayload,
    @Query("documentNumber") documentNumber?: string,
    @Query("email") email?: string,
  ) {
    console.log("ENTRO A LOOKUP");
    const client = await this.clientsService.lookup(
      user.societyId,
      documentNumber,
      email,
    );
    if (!client) throw new NotFoundException("Cliente no encontrado");
    return client;
  }

  @Get(":id")
  @Roles(
    StaffRole.SELLER,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.COLLECTOR,
  )
  getOne(@Param("id") id: string) {
    return this.clientsService.findById(id);
  }

  @Patch(":id")
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.SELLER,
  )
  update(
    @Param("id") id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.update(id, dto, {
      staffId: user.sub,
      name: user.email,
    });
  }

  @Get(":id/history")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  history(@Param("id") id: string) {
    return this.clientsService.history(id);
  }

  @Get()
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  )
  @ApiOperation({
    summary:
      "Listar clientes con paging y filtros (solo admin/manager/super_admin)",
  })
  list(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("perPage", new ParseIntPipe({ optional: true })) perPage?: number,
    @Query("name") name?: string,
    @Query("societyId") societyId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.clientsService.list(
      { page, perPage, name, societyId },
      {
        staffId: user!.sub,
        name: user!.email,
        role: user!.role,
        societyId: user!.societyId,
      },
    );
  }

  @Post(":id/request-verification")
  @Roles(
    StaffRole.SELLER,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: "Solicitar verificacion de precarga de cliente" })
  requestVerification(
    @Param("id") id: string,
    @Body() dto: RequestVerificationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.requestVerification(id, dto.note, {
      staffId: user.sub,
      name: user.email,
    });
  }
}
