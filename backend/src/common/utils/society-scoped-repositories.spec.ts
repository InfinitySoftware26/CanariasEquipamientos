import { SalesRepository } from '../../modules/sales/repositories/sales.repository';
import { CashboxRepository } from '../../modules/cashbox/repositories/cashbox.repository';
import { ClientsRepository } from '../../modules/clients/repositories/clients.repository';
import { ProductsRepository } from '../../modules/products/repositories/products.repository';
import { SuppliersRepository } from '../../modules/suppliers/repositories/suppliers.repository';
import { ReceiptsRepository } from '../../modules/receipts/repositories/receipts.repository';
import { NotificationsRepository } from '../../modules/notifications/repositories/notifications.repository';
import { NotificationDeliveriesRepository } from '../../modules/notification-deliveries/repositories/notification-deliveries.repository';

/**
 * Verifica que el filtro de sociedad viaja en el WHERE de la consulta
 * (no se filtra en memoria después de leer).
 */
type RepoCtor = new (repo: any) => { findById(id: string, societyId?: string): Promise<unknown> };

const cases: Array<[string, RepoCtor, string]> = [
  ['SalesRepository', SalesRepository as unknown as RepoCtor, 'saleId'],
  ['CashboxRepository', CashboxRepository as unknown as RepoCtor, 'cashboxId'],
  ['ClientsRepository', ClientsRepository as unknown as RepoCtor, 'clientId'],
  ['ProductsRepository', ProductsRepository as unknown as RepoCtor, 'productId'],
  ['SuppliersRepository', SuppliersRepository as unknown as RepoCtor, 'supplierId'],
  ['ReceiptsRepository', ReceiptsRepository as unknown as RepoCtor, 'receiptId'],
  ['NotificationsRepository', NotificationsRepository as unknown as RepoCtor, 'notificationId'],
];

describe.each(cases)('%s.findById', (_name, Ctor, pk) => {
  it('con sociedad → la incluye en el WHERE', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    await new Ctor(orm).findById('id-1', 'soc-a');
    expect(orm.findOne.mock.calls[0][0].where).toEqual({ [pk]: 'id-1', societyId: 'soc-a' });
  });

  it('sin sociedad (SUPER_ADMIN / uso interno) → WHERE solo por ID', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    await new Ctor(orm).findById('id-1');
    expect(orm.findOne.mock.calls[0][0].where).toEqual({ [pk]: 'id-1' });
  });
});

describe('NotificationDeliveriesRepository.findByIdForStaff', () => {
  it('filtra por destinatario en el WHERE', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    await new NotificationDeliveriesRepository(orm as any).findByIdForStaff('id-1', 'staff-1');
    expect(orm.findOne).toHaveBeenCalledWith({ where: { deliveryId: 'id-1', staffId: 'staff-1' } });
  });
});
