import { IsUUID } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class ReassignRouteSheetDto {
  @ApiProperty({
    description: "UUID del nuevo cobrador asignado excepcionalmente",
  })
  @IsUUID()
  staffId!: string;
}
