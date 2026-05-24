import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocietyStatus } from '../entities/society.entity';

export class SocietyResponseDto {
  @ApiProperty() societyId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() businessName!: string;
  @ApiProperty() taxId!: string;
  @ApiPropertyOptional() address?: string;
  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional() email?: string;
  @ApiProperty({ enum: SocietyStatus }) status!: SocietyStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
