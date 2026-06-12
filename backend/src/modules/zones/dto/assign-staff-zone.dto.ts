import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffZoneStatus } from '../entities/staff-zone.entity';

export class AssignStaffZoneDto {
  @ApiProperty({ description: 'UUID del empleado a asignar' })
  @IsUUID()
  staffId!: string;

  @ApiPropertyOptional({ enum: StaffZoneStatus, default: StaffZoneStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StaffZoneStatus)
  status?: StaffZoneStatus;
}
