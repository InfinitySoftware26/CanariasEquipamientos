import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsOptional,
  IsObject,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class SaleProductDto {
  @ApiProperty({
    description: "UUID del producto",
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: "Cantidad de unidades",
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: "Precio unitario al momento de la venta",
  })
  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @ApiProperty({
    required: false,
    description:
      "Detalles libres del producto vendido (marca/modelo/pulgadas/serie/etc.)",
  })
  @IsOptional()
  @IsObject()
  customDetails?: Record<string, string>;
}
