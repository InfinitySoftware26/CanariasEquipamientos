import { Client } from "../entities/client.entity";

export interface IClientsRepository {
  create(data: Partial<Client>): Promise<Client>;
  update(id: string, data: Partial<Client>): Promise<Client>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Client | null>;
  findByDocumentNumber(documentNumber: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAllBySociety(societyId: string): Promise<Client[]>;
  findPaged(
    filter: { name?: string },
    page: number,
    perPage: number,
    societyId?: string | null
  ): Promise<[Client[], number]>;
}

export const CLIENTS_REPOSITORY = "IClientsRepository";
