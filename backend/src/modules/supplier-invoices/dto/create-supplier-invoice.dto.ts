import { IsUUID, IsString, IsNotEmpty, IsNumber, IsPositive, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierInvoiceDto {
  @ApiProperty({ description: 'UUID del proveedor' })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({ example: 'A-0001-00012345' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  issueDate!: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @IsPositive()
  totalAmount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
