import { NotFoundException } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZonesRepository } from '../repositories/zones.repository';
import { ZoneStatus } from '../entities/zone.entity';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

const OWN = 'soc-a';
const OTHER = 'soc-b';
const ZONE_ID = '11111111-1111-4111-8111-111111111111';

const scope = (role: StaffRole, societyId: string) =>
  societyScopeOf({ sub: 's', email: 'x', role, societyId });

function build() {
  const zone = { zoneId: ZONE_ID, societyId: OWN, status: ZoneStatus.ACTIVE, name: 'Centro' };
  const zonesRepo = {
    findById: jest.fn(async (id: string, societyId?: string) =>
      id === ZONE_ID && (societyId === undefined || societyId === zone.societyId) ? zone : null),
    findByNameAndSociety: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(zone),
    softDelete: jest.fn().mockResolvedValue(undefined),
  };
  return { zonesRepo, service: new ZonesService(zonesRepo as any, {} as any, {} as any) };
}

describe('ZonesService — aislamiento por sociedad', () => {
  it('findById: propio OK, cruzado 404, SUPER_ADMIN OK (antes 404)', async () => {
    const { service } = build();
    await expect(service.findById(ZONE_ID, scope(StaffRole.ADMIN, OWN))).resolves.toMatchObject({ zoneId: ZONE_ID });
    await expect(service.findById(ZONE_ID, scope(StaffRole.ADMIN, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.findById(ZONE_ID, scope(StaffRole.SUPER_ADMIN, OTHER))).resolves.toMatchObject({ zoneId: ZONE_ID });
  });

  it('update de SUPER_ADMIN valida unicidad en la sociedad de la zona, no la del token', async () => {
    const { service, zonesRepo } = build();
    await service.update(ZONE_ID, { name: 'Norte' } as any, scope(StaffRole.SUPER_ADMIN, OTHER));
    expect(zonesRepo.findByNameAndSociety).toHaveBeenCalledWith('Norte', OWN);
  });

  it('deactivate cruzado → 404 sin escribir', async () => {
    const { service, zonesRepo } = build();
    await expect(service.deactivate(ZONE_ID, scope(StaffRole.MANAGER, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(zonesRepo.softDelete).not.toHaveBeenCalled();
  });
});

describe('ZonesRepository.findById', () => {
  it('filtra por sociedad en el WHERE cuando se pasa', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    const repo = new ZonesRepository(orm as any);
    await repo.findById(ZONE_ID, OWN);
    await repo.findById(ZONE_ID);
    expect(orm.findOne.mock.calls[0][0].where).toEqual({ zoneId: ZONE_ID, societyId: OWN });
    expect(orm.findOne.mock.calls[1][0].where).toEqual({ zoneId: ZONE_ID });
  });
});
