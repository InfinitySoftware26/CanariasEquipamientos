import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import {
  IClientsRepository,
  CLIENTS_REPOSITORY,
} from "../interfaces/clients-repository.interface";
import { Client } from "../entities/client.entity";
import { CreateClientDto } from "../dto/create-client.dto";
import { UpdateClientDto } from "../dto/update-client.dto";
import { ClientHistory } from "../entities/client-history.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StaffRole } from "../../../common/enums/staff-role.enum";

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENTS_REPOSITORY)
    private readonly clientsRepo: IClientsRepository,
    @InjectRepository(ClientHistory)
    private readonly historyRepo: Repository<ClientHistory>,
  ) {}

  async createPreload(
    dto: CreateClientDto,
    performer: { staffId: string; name: string; societyId?: string },
  ): Promise<Client> {
    const data: Partial<Client> = {
      name: dto.name,
      surname: dto.surname,
      documentNumber: dto.documentNumber,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      zoneId: dto.zoneId,
      nameReference1: dto.nameReference1,
      telReference1: dto.telReference1,
      addressReference1: dto.addressReference1,
      nameReference2: dto.nameReference2,
      telReference2: dto.telReference2,
      addressReference2: dto.addressReference2,
      supportDni: !!dto.supportDni,
      supportBill: !!dto.supportBill,
      supportVisit: !!dto.supportVisit,
      visitName: dto.visitName,
      visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
      observations: dto.observations,
      societyId: performer.societyId ?? dto.societyId,
      createdBy: performer.staffId,
      updatedBy: performer.staffId,
    };
    const existingClient = await this.clientsRepo.findByDocumentNumber(
      dto.documentNumber ?? "",
    );

    if (existingClient) {
      throw new ConflictException(
        "Ya existe un cliente registrado con ese DNI.",
      );
    }

    const client = await this.clientsRepo.create(data);
    await this.historyRepo.save(
      this.historyRepo.create({
        clientId: client.clientId,
        snapshot: client,
        action: "create",
        performedBy: performer.staffId,
        performedByName: performer.name,
      }),
    );
    return client;
  }

  async list(
    query: {
      page?: number;
      perPage?: number;
      name?: string;
      societyId?: string | null;
    },
    performer: {
      staffId: string;
      name: string;
      role: string;
      societyId?: string;
    },
  ): Promise<{
    items: Client[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const perPage =
      query.perPage && query.perPage > 0 ? Math.min(query.perPage, 100) : 20;

    let effectiveSociety: string | null = null;
    if (performer.role === StaffRole.SUPER_ADMIN) {
      effectiveSociety = query.societyId ?? null;
    } else {
      effectiveSociety = performer.societyId ?? null;
    }

    const [items, total] = await this.clientsRepo.findPaged(
      { name: query.name },
      page,
      perPage,
      effectiveSociety,
    );
    return { items, total, page, perPage };
  }

  async update(
    clientId: string,
    dto: UpdateClientDto,
    performer: { staffId: string; name: string },
  ): Promise<Client> {
    const existing = await this.clientsRepo.findById(clientId);
    if (!existing) throw new NotFoundException("Cliente no encontrado");

    const updateData: Partial<Client> = {
      ...dto,
      visitDate: dto.visitDate ? new Date(dto.visitDate) : existing.visitDate,
      updatedBy: performer.staffId,
    } as any;

    const updated = await this.clientsRepo.update(clientId, updateData);
    await this.historyRepo.save(
      this.historyRepo.create({
        clientId: updated.clientId,
        snapshot: updated,
        action: "update",
        performedBy: performer.staffId,
        performedByName: performer.name,
      }),
    );
    return updated;
  }

  async requestVerification(
    clientId: string,
    note: string | undefined,
    performer: { staffId: string; name: string },
  ): Promise<Client> {
    const existing = await this.clientsRepo.findById(clientId);
    if (!existing) throw new NotFoundException("Cliente no encontrado");

    const updateData: Partial<Client> = {
      verificationRequestedBy: performer.staffId,
      verificationRequestedByName: performer.name,
      verificationRequestedAt: new Date(),
      verificationNote: note,
      updatedBy: performer.staffId,
    } as any;

    const updated = await this.clientsRepo.update(clientId, updateData);
    await this.historyRepo.save(
      this.historyRepo.create({
        clientId: updated.clientId,
        snapshot: updated,
        action: "request_verification",
        performedBy: performer.staffId,
        performedByName: performer.name,
      }),
    );
    return updated;
  }

  async lookup(
    currentSocietyId: string,
    documentNumber?: string,
    email?: string,
  ): Promise<(Client & { alreadyInCurrentSociety: boolean }) | null> {
    if (!documentNumber && !email) return null;

    const found = documentNumber
      ? await this.clientsRepo.findByDocumentNumber(documentNumber)
      : await this.clientsRepo.findByEmail(email!);

    if (!found) return null;

    return {
      ...found,
      alreadyInCurrentSociety: found.societyId === currentSocietyId,
    };
  }

  findById(id: string): Promise<Client | null> {
    return this.clientsRepo.findById(id);
  }

  findAllBySociety(societyId: string): Promise<Client[]> {
    return this.clientsRepo.findAllBySociety(societyId);
  }

  async history(clientId: string): Promise<ClientHistory[]> {
    return this.historyRepo.find({
      where: { clientId },
      order: { performedAt: "DESC" },
    });
  }
}
