export interface Client {
  clientId: string;

  name?: string;
  surname?: string;

  documentNumber?: string;
  createdBy?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdByName: string;
  createdBySocietyName: string;

  observations?: string;

  supportDni: boolean;
  supportBill: boolean;
  supportVisit: boolean;

  visitName?: string;
  visitDate?: string;

  verificationRequestedAt?: string;
  verificationRequestedByName?: string;
  verificationNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ClientsResponse {
  items: Client[];
  total: number;
  page: number;
  perPage: number;
}

export interface ClientLookupResponse extends Client {
  alreadyInCurrentSociety: boolean;
}

export interface CreateClientPayload {
  name: string;
  surname: string;
  documentNumber: string;
  address: string;
  phone: string;
}

export interface CreatePreloadClientDto {
  name: string;
  surname: string;
  documentNumber: string;
  phone: string;
  address: string;

  // backend espera defaults o los completa
  supportDni?: boolean;
  supportBill?: boolean;
  supportVisit?: boolean;
}

export type ClientView = Client & {
  isActive: boolean;
  societyName?: string;
  societyId?: string;
};
