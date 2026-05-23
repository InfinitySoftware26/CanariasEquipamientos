import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssignmentStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}

export class AssignStaffDto {
  @ApiProperty({ description: 'ID del empleado a asignar' })
  @IsUUID()
  staffId!: string;

  @ApiPropertyOptional({ enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
}
