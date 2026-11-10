import type { Type } from "@nestjs/common";

import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

import { IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";

import { CreateSocietyDto } from "./create-society.dto";

import { SocietyStatus } from "../entities/society.entity";

/**
 * Todos los campos de alta son opcionales, incluido taxId (con la misma
 * validación de formato). Editar taxId queda reservado a SUPER_ADMIN y se
 * controla en SocietiesService.update, que además verifica unicidad.
 */
type UpdateSocietyBaseDto = Partial<CreateSocietyDto>;

const UpdateSocietyBase: Type<UpdateSocietyBaseDto> = PartialType(CreateSocietyDto);

export class UpdateSocietyDto extends UpdateSocietyBase {
  @ApiPropertyOptional({
    enum: SocietyStatus,
  })
  @IsOptional()
  @IsEnum(SocietyStatus)
  status?: SocietyStatus;

  @ApiPropertyOptional({
    example: 0.002,
    description:
      "Tasa diaria de mora por defecto de la sucursal. 0.002 equivale a 0,2% diario.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  defaultDailyLateInterestRate?: number;
}
