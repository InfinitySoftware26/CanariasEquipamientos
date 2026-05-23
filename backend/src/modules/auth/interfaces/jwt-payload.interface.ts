import { StaffRole } from '../../../common/enums/staff-role.enum';

export interface JwtPayload {
  sub:       string;
  email:     string;
  role:      StaffRole;
  societyId: string;
  iat?:      number;
  exp?:      number;
}
