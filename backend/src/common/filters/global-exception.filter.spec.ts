import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { GlobalExceptionFilter, UNIQUE_VIOLATION_MESSAGE } from './global-exception.filter';

function host() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const h = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'POST', url: '/api/v1/cashbox' }),
    }),
  } as unknown as ArgumentsHost;
  return { h, status, json };
}

const pgError = (code: string, constraint?: string) =>
  new QueryFailedError('INSERT ...', [], Object.assign(new Error('duplicate key value violates unique constraint'), { code, constraint }));

describe('GlobalExceptionFilter', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('QueryFailedError 23505 → 409 con mensaje genérico, sin nombre de constraint', () => {
    const { h, status, json } = host();
    new GlobalExceptionFilter().catch(pgError('23505', 'uq_cashbox_one_open_per_society'), h);

    expect(status).toHaveBeenCalledWith(409);
    const body = json.mock.calls[0][0];
    expect(body).toMatchObject({ statusCode: 409, message: UNIQUE_VIOLATION_MESSAGE });
    expect(JSON.stringify(body)).not.toContain('uq_cashbox');
    expect(JSON.stringify(body)).not.toContain('duplicate key');
  });

  it('otro QueryFailedError → 500 genérico', () => {
    const { h, status, json } = host();
    new GlobalExceptionFilter().catch(pgError('23503'), h);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].message).toBe('Error interno del servidor');
  });

  it('HttpException conserva su status y mensaje', () => {
    const { h, status, json } = host();
    new GlobalExceptionFilter().catch(new NotFoundException('Caja no encontrada'), h);
    expect(status).toHaveBeenCalledWith(404);
    expect(json.mock.calls[0][0].message).toBe('Caja no encontrada');
  });
});
