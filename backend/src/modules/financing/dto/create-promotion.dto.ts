import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ArrayUnique,
  Max,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

export class CreatePromotionDto {
  @ApiProperty({ example: "Promo Agosto" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: "Plan sobre el cual se basa la promoción. Si no se informa, es independiente.",
  })
  @IsOptional()
  @IsUUID()
  financingPlanId?: string;

  @ApiPropertyOptional({
    example: -0.05,
    description:
      "Ajuste sobre la tasa base. Negativo = descuento al cliente, positivo = recargo. En promoción basada en plan puede sobrescribir la del plan.",
  })
  @IsOptional()
  @IsNumber()
  @Min(-1)
  @Max(1)
  discountPercentage?: number;

  @ApiPropertyOptional({ enum: PaymentFrequency })
  @IsOptional()
  @IsEnum(PaymentFrequency)
  paymentFrequency?: PaymentFrequency;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  installmentsCount?: number;

  @ApiPropertyOptional({
    default: false,
    description: "Solo para promociones independientes: aplica a todos los productos de la sociedad.",
  })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: "Solo para promociones independientes no globales.",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  productIds?: string[];
}
