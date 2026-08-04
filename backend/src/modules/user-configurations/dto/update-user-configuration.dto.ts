import { IsOptional, IsString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserConfigurationDto {
  @ApiPropertyOptional({ description: 'Preferencias del dashboard (widgets visibles, orden, etc.)' })
  @IsOptional()
  @IsObject()
  dashboardPreferences?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'dark' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ description: 'Preferencias de notificaciones (canales habilitados, etc.)' })
  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, unknown>;
}
