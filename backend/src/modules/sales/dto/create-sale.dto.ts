import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
} from "class-validator";

import { Type } from "class-transformer";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { SaleProductDto } from "./sale-product.dto";

export class CreateSaleDto {
  @ApiProperty({
    description: "UUID del cliente",
  })
  @IsUUID()
  clientId!: string;

  @ApiProperty({
    example: 12,
    description: "Cantidad de cuotas entre 1 y 100",
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  installmentsCount!: number;

  @ApiProperty({
    enum: PaymentFrequency,
    example: PaymentFrequency.MONTHLY,
  })
  @IsEnum(PaymentFrequency)
  paymentFrequency!: PaymentFrequency;

  @ApiPropertyOptional({
    description: "Observaciones opcionales",
  })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty({
    type: [SaleProductDto],
    description: "Productos incluidos en la venta",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleProductDto)
  products!: SaleProductDto[];

  @ApiPropertyOptional({
    description: "Plan de financiación seleccionado por el vendedor",
  })
  @IsOptional()
  @IsUUID()
  financingPlanId?: string;

  @ApiPropertyOptional({
    description: "Promoción seleccionada por el vendedor",
  })
  @IsOptional()
  @IsUUID()
  promotionId?: string;
}
