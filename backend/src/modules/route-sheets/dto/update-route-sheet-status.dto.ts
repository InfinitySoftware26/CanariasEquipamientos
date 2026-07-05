import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RouteSheetStatus } from '../../../common/enums/route-sheet-status.enum';

export class UpdateRouteSheetStatusDto {
  @ApiProperty({ enum: RouteSheetStatus, example: RouteSheetStatus.IN_PROGRESS })
  @IsEnum(RouteSheetStatus)
  status!: RouteSheetStatus;
}
