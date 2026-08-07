import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class ScheduleDeliveryDto {
  constructor(deliveryDate: string) {
    this.deliveryDate = deliveryDate;
  }
  @ApiProperty({
    example: "2026-08-07",
    description: "Fecha coordinada para la entrega del producto.",
  })
  @IsDateString()
  deliveryDate: string;
}
