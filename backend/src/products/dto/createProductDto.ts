import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUrl,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { productStatus, productCategory } from '../products.repository';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  sku: string;

  @IsEnum(productCategory)
  category: productCategory;

  @IsNumber()
  price: number;

  @IsNumber()
  cost: number;

  @IsString()
  brand: string;

  @IsNumber()
  stock: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(productStatus)
  status: productStatus = productStatus.ACTIVE; // 👈 valor por defecto

  @IsString()
  suppliers: string;

  @IsDate()
  entryDate: Date;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsDate()
  @IsOptional()
  saleDate?: Date;
}
