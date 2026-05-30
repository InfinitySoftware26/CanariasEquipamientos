import { Client } from "../entities/client.entity";

export interface IClientsRepository {
  create(data: Partial<Client>): Promise<Client>;
  update(id: string, data: Partial<Client>): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findAllBySociety(societyId: string): Promise<Client[]>;
  findPaged(
    filter: { name?: string },
    page: number,
    perPage: number,
    societyId?: string | null
  ): Promise<[Client[], number]>;
}

export const CLIENTS_REPOSITORY = "IClientsRepository";
