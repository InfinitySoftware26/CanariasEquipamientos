import { ClientsService } from './clients.service';
import { Client } from '../entities/client.entity';

describe('ClientsService.createPreload', () => {
  it('uses the active session society instead of any society sent in the payload', async () => {
    const clientsRepo = {
      create: jest.fn(),
    };

    const historyRepo = {
      save: jest.fn(),
      create: jest.fn((data) => data),
    };

    const service = new ClientsService(clientsRepo as any, historyRepo as any);

    const createdClient = {
      clientId: 'client-1',
      name: 'Juan',
    } as Client;

    clientsRepo.create.mockResolvedValue(createdClient);

    await service.createPreload(
      {
        name: 'Juan',
        societyId: 'payload-society-id',
      },
      {
        staffId: 'staff-1',
        name: 'tester@example.com',
        societyId: 'active-session-society-id',
      },
    );

    expect(clientsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        societyId: 'active-session-society-id',
      }),
    );
  });
});
