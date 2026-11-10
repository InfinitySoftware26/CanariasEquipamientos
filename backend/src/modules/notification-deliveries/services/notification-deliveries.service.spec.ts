import { NotFoundException } from '@nestjs/common';
import { NotificationDeliveriesService } from './notification-deliveries.service';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const DELIVERY_ID = '11111111-1111-4111-8111-111111111111';
const delivery = { deliveryId: DELIVERY_ID, staffId: 'owner' };

const user = (sub: string, role = StaffRole.ADMIN): JwtPayload => ({
  sub, email: 'x@x.com', role, societyId: 'soc-a',
});

function build() {
  const repo = {
    findByIdForStaff: jest.fn(async (id: string, staffId: string) =>
      id === DELIVERY_ID && staffId === delivery.staffId ? delivery : null),
    updateStatus: jest.fn(async () => undefined),
  };
  return { repo, service: new NotificationDeliveriesService(repo as any) };
}

describe('NotificationDeliveriesService.markAsRead — aislamiento', () => {
  it('entrega propia → la marca como leída', async () => {
    const { repo, service } = build();
    await service.markAsRead(DELIVERY_ID, user('owner'));
    expect(repo.findByIdForStaff).toHaveBeenCalledWith(DELIVERY_ID, 'owner');
    expect(repo.updateStatus).toHaveBeenCalledWith(DELIVERY_ID, NotificationDeliveryStatus.READ);
  });

  it('entrega de otro usuario (de cualquier sociedad) → 404, antes 403, sin modificar', async () => {
    const { repo, service } = build();
    await expect(service.markAsRead(DELIVERY_ID, user('intruder'))).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN → su propia entrega OK; la bandeja es personal', async () => {
    const { repo, service } = build();
    await service.markAsRead(DELIVERY_ID, user('owner', StaffRole.SUPER_ADMIN));
    expect(repo.updateStatus).toHaveBeenCalled();
    await expect(service.markAsRead(DELIVERY_ID, user('other-sa', StaffRole.SUPER_ADMIN)))
      .rejects.toBeInstanceOf(NotFoundException);
  });
});
