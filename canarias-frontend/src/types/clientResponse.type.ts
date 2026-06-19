export interface ClientResponse {
  clientId: string;

  name: string;
  surname: string;

  documentNumber: string;

  address: string;

  phone: string;

  observations?: string;
}

export interface ClientApiResponse {
  clientId?: string;
  id?: string;
  client_id?: string;

  name?: string;
  surname?: string;
  documentNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  observations?: string;

  client?: ClientApiResponse;
  data?: ClientApiResponse;
}
