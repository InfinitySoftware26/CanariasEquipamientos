import { IsDateString, IsEnum, IsNumber, IsPositive } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

export class RefinanceInstallmentsDto {
  @ApiProperty({
    example: 30000,
    description: "Monto que el cliente acuerda poder pagar por cuota",
  })
  @IsNumber()
  @IsPositive()
  installmentAmount!: number;

  @ApiProperty({
    example: "2026-10-10",
    description: "Fecha de vencimiento de la primera cuota refinanciada",
  })
  @IsDateString()
  firstDueDate!: string;

  @ApiProperty({
    enum: PaymentFrequency,
    example: PaymentFrequency.MONTHLY,
  })
  @IsEnum(PaymentFrequency)
  paymentFrequency!: PaymentFrequency;
}
