import { IsUUID } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class AddRouteSheetInstallmentDto {
  @ApiProperty({
    description: "UUID de la cuota que se desea agregar manualmente",
  })
  @IsUUID()
  installmentId!: string;
}
