export interface Client {
  clientId: string;

  name?: string;
  surname?: string;

  documentNumber?: string;
  createdBy?: string;
  address?: string;
  zoneId?: string;
  phone?: string;
  email?: string;
  nameReference1?: string;
  telReference1?: string;
  addressReference1?: string;
  nameReference2?: string;
  telReference2?: string;
  addressReference2?: string;
  createdByName: string;
  createdBySocietyName: string;
  societyId: string;

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
  zoneId?: string;
  nameReference1: string;
  telReference1: string;
  addressReference1: string;
  nameReference2: string;
  telReference2: string;
  addressReference2: string;
}

export interface CreatePreloadClientDto extends CreateClientPayload {
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
