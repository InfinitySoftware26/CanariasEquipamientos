import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min, ArrayUnique } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

export class CreateFinancingPlanDto {
  @ApiProperty({ example: "Semanal 20" })
  @IsString()
  name!: string;

  @ApiProperty({ description: "Financiación que define el porcentaje de ganancia." })
  @IsUUID()
  financingConfigId!: string;

  @ApiProperty({ enum: PaymentFrequency, example: PaymentFrequency.WEEKLY })
  @IsEnum(PaymentFrequency)
  paymentFrequency!: PaymentFrequency;

  @ApiProperty({ example: 20, description: "Cantidad de cuotas. No se limita a 3, 6 o 9." })
  @IsInt()
  @Min(1)
  @Max(1000)
  installmentsCount!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({ type: [String], description: "Productos a los que aplica cuando isGlobal es false." })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  productIds?: string[];
}
