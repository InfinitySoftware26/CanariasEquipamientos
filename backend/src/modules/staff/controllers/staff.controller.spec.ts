import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { StaffController } from './staff.controller';

/**
 * Dos handlers con el mismo método + ruta hacen que el segundo quede
 * inalcanzable (Express despacha al primero registrado).
 */
describe('StaffController — rutas', () => {
  const proto = StaffController.prototype as unknown as Record<string, unknown>;
  const routes = Object.getOwnPropertyNames(proto)
    .filter((name) => name !== 'constructor' && typeof proto[name] === 'function')
    .map((name) => {
      const handler = proto[name] as object;
      const path = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
      return { name, key: path === undefined ? null : `${RequestMethod[method!]} ${path}` };
    })
    .filter((r) => r.key !== null);

  it('no declara dos handlers con el mismo método y ruta', () => {
    const keys = routes.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('PATCH :id → update y PATCH :id/deactivate → deactivate', () => {
    expect(routes.find((r) => r.key === 'PATCH :id')?.name).toBe('update');
    expect(routes.find((r) => r.key === 'PATCH :id/deactivate')?.name).toBe('deactivate');
  });
});
