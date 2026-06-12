import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateZoneDto } from './create-zone.dto';
import { ZoneStatus } from '../entities/zone.entity';

export class UpdateZoneDto extends PartialType(CreateZoneDto) {
  @ApiPropertyOptional({ enum: ZoneStatus })
  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;
}
