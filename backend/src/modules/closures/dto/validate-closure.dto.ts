import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateClosureDto {
  @ApiProperty({ enum: ['validated', 'rejected'], example: 'validated' })
  @IsIn(['validated', 'rejected'])
  status!: 'validated' | 'rejected';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}
