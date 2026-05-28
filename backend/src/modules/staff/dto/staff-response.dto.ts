import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '../../../common/enums/staff-role.enum';

export class StaffResponseDto {
  @ApiProperty() staffId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() dni!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: StaffRole }) role!: StaffRole;
  @ApiProperty() societyId!: string;
  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional() address?: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
