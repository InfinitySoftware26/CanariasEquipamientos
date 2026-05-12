import { Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/createStaffDto';
import { UpdateStaffDto } from './dto/uploadStaffDto';

// export interface Staff {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

@Injectable()
export class StaffService {
  findAll() {
    return 'This action returns all staff';
  }

  findOne(id: string) {
    return `This action returns the staff with id: ${id}`;
  }

  create(staff: CreateStaffDto) {
    return `This action adds a new staff member: ${staff.name}`;
  }

  update(id: string, staff: UpdateStaffDto) {
    return `This action updates the staff member with id: ${id} and name: ${staff.name}`;
  }
}
