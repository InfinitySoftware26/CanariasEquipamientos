import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateSocietyDto } from './create-society.dto';
import { SocietyStatus } from '../entities/society.entity';

export class UpdateSocietyDto extends PartialType(
  OmitType(CreateSocietyDto, ['taxId'] as const),
) {
  @ApiPropertyOptional({ enum: SocietyStatus })
  @IsOptional()
  @IsEnum(SocietyStatus)
  status?: SocietyStatus;
}
