export interface PreloadFormData {
  // Cliente → POST /clients/preload
  name: string;
  surname: string;
  documentNumber: string;
  address: string;
  locality: string;
  phone: string;
  product: string;
  installments: string;
  installmentValue: string;
  ref1Phone: string;
  ref1Relationship: string;
  ref1Address: string;
  ref2Phone: string;
  ref2Relationship: string;
  ref2Address: string;
}
