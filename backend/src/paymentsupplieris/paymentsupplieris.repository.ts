import { Injectable } from '@nestjs/common';
import { CreatePaymentSupplierDto } from './dto/createPaymentSupplierDto';
import { UpdatePaymentSupplierDto } from './dto/updatePaymentSupplierDto';

@Injectable()
export class PaymentSupplierIsRepository {
  findAll(): string {
    return 'este metodo devuelve todos los pagos a proveedores';
  }
  findOne(id: string): string {
    return 'este metodo devuelve un pago a proveedor por su ID';
  }
  findBySupplierId(supplierId: string): string {
    return 'este metodo devuelve los pagos a proveedores por proveedor';
  }
  create(PaymentSupplieriData: CreatePaymentSupplierDto): string {
    return 'este metodo crea un nuevo pago a proveedor';
  }
  update(id: string, PaymentSupplieriData: UpdatePaymentSupplierDto): string {
    return 'este metodo actualiza un pago a proveedor por su ID';
  }
}
