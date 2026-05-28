import { StaffRole } from '../enums/staff-role.enum';

/**
 * Payload del JWT — interfaz transversal usada por guards, decoradores y módulos.
 * Vive en common/ porque múltiples capas la necesitan sin crear dependencias cruzadas.
 */
export interface JwtPayload {
  sub:       string;   // staff_id
  email:     string;
  role:      StaffRole;
  societyId: string;
  iat?:      number;
  exp?:      number;
}
