import {
  IsString,
  IsOptional,
  IsEmail,
  Matches,
  IsBoolean,
  IsUUID,
  IsDateString,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surname?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documentNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportDni?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportBill?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportVisit?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() visitName?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() visitDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() societyId?: string;
}
