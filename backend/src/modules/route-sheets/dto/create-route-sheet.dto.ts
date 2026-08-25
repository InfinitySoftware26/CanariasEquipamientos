import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateRouteSheetDto {
  @IsUUID()
  @IsNotEmpty()
  zoneId!: string;

  @IsUUID()
  @IsNotEmpty()
  staffId!: string;

  @IsDateString()
  @IsNotEmpty()
  routeDate!: string;

  /**
   * Cuotas que el administrador seleccionó
   * para incluir en esta hoja de ruta.
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  installmentIds!: string[];
}
