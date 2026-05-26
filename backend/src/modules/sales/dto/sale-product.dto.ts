import { IsUUID, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaleProductDto {
  @ApiProperty({ description: 'UUID del producto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Cantidad de unidades' })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ description: 'Precio unitario al momento de la venta' })
  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}
