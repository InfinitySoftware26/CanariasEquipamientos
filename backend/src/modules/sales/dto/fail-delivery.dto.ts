import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FailDeliveryDto {
  @ApiProperty({ description: 'Motivo por el que no se pudo realizar la entrega' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
