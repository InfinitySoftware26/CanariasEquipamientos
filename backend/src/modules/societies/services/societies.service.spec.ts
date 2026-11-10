import { ConflictException, ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SocietiesService } from './societies.service';
import { UpdateSocietyDto } from '../dto/update-society.dto';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const SOC_A = '11111111-1111-4111-8111-111111111111';
const SOC_B = '22222222-2222-4222-8222-222222222222';

const user = (role: StaffRole): JwtPayload => ({ sub: 's1', email: 'x@x.com', role, societyId: SOC_A });

function build() {
  const societies: Record<string, { societyId: string; taxId: string }> = {
    [SOC_A]: { societyId: SOC_A, taxId: '30-71234567-1' },
    [SOC_B]: { societyId: SOC_B, taxId: '30-50000000-7' },
  };
  const repo = {
    findById: jest.fn(async (id: string) => societies[id] ?? null),
    findByTaxId: jest.fn(async (taxId: string) => Object.values(societies).find((s) => s.taxId === taxId) ?? null),
    update: jest.fn(async (id: string, dto: object) => ({ ...societies[id], ...dto })),
  };
  return { repo, service: new SocietiesService(repo as any, {} as any) };
}

describe('SocietiesService.update — taxId', () => {
  it('SUPER_ADMIN cambia el CUIT a uno libre → OK', async () => {
    const { repo, service } = build();
    await service.update(SOC_A, { taxId: '20-12345678-6' } as UpdateSocietyDto, user(StaffRole.SUPER_ADMIN));
    expect(repo.update).toHaveBeenCalledWith(SOC_A, { taxId: '20-12345678-6' });
  });

  it('SUPER_ADMIN reenvía el CUIT actual de la misma sociedad → OK', async () => {
    const { repo, service } = build();
    await service.update(SOC_A, { taxId: '30-71234567-1' } as UpdateSocietyDto, user(StaffRole.SUPER_ADMIN));
    expect(repo.update).toHaveBeenCalled();
  });

  it('SUPER_ADMIN usa el CUIT de otra sociedad → 409 sin escribir', async () => {
    const { repo, service } = build();
    await expect(
      service.update(SOC_A, { taxId: '30-50000000-7' } as UpdateSocietyDto, user(StaffRole.SUPER_ADMIN)),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([StaffRole.MANAGER, StaffRole.ADMIN])('%s no puede cambiar el CUIT → 403', async (role) => {
    const { repo, service } = build();
    await expect(
      service.update(SOC_A, { taxId: '20-12345678-6' } as UpdateSocietyDto, user(role)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('sin taxId en el body no consulta unicidad', async () => {
    const { repo, service } = build();
    await service.update(SOC_A, { name: 'Nueva' } as UpdateSocietyDto, user(StaffRole.SUPER_ADMIN));
    expect(repo.findByTaxId).not.toHaveBeenCalled();
  });
});

describe('UpdateSocietyDto.taxId — formato', () => {
  it.each(['30-71234567', '30712345671', '3-71234567-1', 'ab-cdefghij-k'])('rechaza "%s"', async (taxId) => {
    const errors = await validate(plainToInstance(UpdateSocietyDto, { taxId }));
    expect(errors.map((e) => e.property)).toContain('taxId');
  });

  it('acepta XX-XXXXXXXX-X', async () => {
    const errors = await validate(plainToInstance(UpdateSocietyDto, { taxId: '20-12345678-6' }));
    expect(errors).toHaveLength(0);
  });
});
