import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class RequestVerificationDto {
  @ApiPropertyOptional({ description: "Nota del vendedor para el verificador" })
  @IsOptional()
  @IsString()
  note?: string;
}
