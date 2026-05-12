import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/createSalesDto';
import { UpdateSaleDto } from './dto/updateSalesDto';

@Injectable()
export class SalesRepository {

  saleCreate(sale: CreateSaleDto) {
    return 'este metodo crea una nueva venta';
  }

  saleFindAll() {
    return 'este metodo devuelve todas las ventas';
  }

  saleFindOne(id: string) {
    return 'este metodo devuelve una venta por su id';
  }

  saleUpdate(id: string, sale: UpdateSaleDto) {
    return 'este metodo actualiza una venta';
  }

  saleDelete(id: string) {
    return 'este metodo elimina una venta';
  }

  findByDateRange(from: string, to: string) {
    return 'este metodo devuelve las ventas entre dos fechas';
  }

  findByStaff(staffId: string) {
    return 'este metodo devuelve las ventas realizadas por un vendedor o cobrador';
  }

  findByClient(clientId: string) {
    return 'este metodo devuelve las ventas realizadas a un cliente';
  }
}
