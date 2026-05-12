import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/updateProductDto';
import { CreateProductDto } from './dto/createProductDto';

export enum productStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  PENDING_ARRIVAL = 'PENDING_ARRIVAL',
  NEEDS_ORDER = 'NEEDS_ORDER',
}

export enum productCategory {
  ELECTRONICS = 'ELECTRONICS',
  FURNITURE = 'FURNITURE',
  PHONES = 'PHONES',
  COMPUTERS = 'COMPUTERS',
  APPLIANCES = 'APPLIANCES',
}

export type Product = {
  id: number;
  name: string;
  model: string;
  sku: string;
  category: productCategory;
  price: number;
  cost: number;
  brand: string;
  stock: number;
  description: string;
  status: productStatus;
  suppliers: string; // FK o ID de proveedor
  entryDate: Date; // fecha de ingreso
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string;
  saleDate: Date; // fecha de venta
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Electric Guitar',
    model: 'Stratocaster',
    sku: 'ELEC-GTR-001',
    category: productCategory.ELECTRONICS,
    price: 1200.0,
    cost: 800.0,
    brand: 'Fender',
    stock: 5,
    description: 'Classic electric guitar with single-coil pickups',
    status: productStatus.ACTIVE,
    suppliers: 'supplier_01',
    entryDate: new Date('2026-01-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/electric-guitar.jpg',
    saleDate: new Date('2026-02-15'),
  },
  {
    id: 2,
    name: 'Smartphone',
    model: 'Galaxy S25',
    sku: 'PHONE-002',
    category: productCategory.PHONES,
    price: 950.0,
    cost: 600.0,
    brand: 'Samsung',
    stock: 20,
    description: 'Latest generation smartphone with AMOLED display',
    status: productStatus.PENDING_ARRIVAL,
    suppliers: 'supplier_02',
    entryDate: new Date('2026-01-12'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/galaxy-s25.jpg',
    saleDate: new Date('2026-03-01'),
  },
  {
    id: 3,
    name: 'Office Chair',
    model: 'ErgoComfort',
    sku: 'FURN-003',
    category: productCategory.FURNITURE,
    price: 300.0,
    cost: 180.0,
    brand: 'Herman Miller',
    stock: 0,
    description: 'Ergonomic office chair with lumbar support',
    status: productStatus.NEEDS_ORDER,
    suppliers: 'supplier_03',
    entryDate: new Date('2026-01-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/office-chair.jpg',
    saleDate: new Date('2026-03-10'),
  },
  {
    id: 4,
    name: 'Laptop',
    model: 'MacBook Pro 16',
    sku: 'COMP-004',
    category: productCategory.COMPUTERS,
    price: 2500.0,
    cost: 1800.0,
    brand: 'Apple',
    stock: 10,
    description: 'High-performance laptop for professionals',
    status: productStatus.ACTIVE,
    suppliers: 'supplier_04',
    entryDate: new Date('2026-01-25'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/macbook-pro.jpg',
    saleDate: new Date('2026-03-20'),
  },
  {
    id: 5,
    name: 'Refrigerator',
    model: 'CoolMax 500',
    sku: 'APPL-005',
    category: productCategory.APPLIANCES,
    price: 1200.0,
    cost: 700.0,
    brand: 'LG',
    stock: 2,
    description: 'Energy-efficient refrigerator with smart features',
    status: productStatus.INACTIVE,
    suppliers: 'supplier_05',
    entryDate: new Date('2026-02-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/refrigerator.jpg',
    saleDate: new Date('2026-03-25'),
  },
  {
    id: 6,
    name: 'Acoustic Guitar',
    model: 'Dreadnought',
    sku: 'MUSIC-006',
    category: productCategory.ELECTRONICS,
    price: 600.0,
    cost: 350.0,
    brand: 'Yamaha',
    stock: 12,
    description: 'Full-bodied acoustic guitar with spruce top',
    status: productStatus.DISCONTINUED,
    suppliers: 'supplier_06',
    entryDate: new Date('2026-02-05'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/acoustic-guitar.jpg',
    saleDate: new Date('2026-04-01'),
  },
  {
    id: 7,
    name: 'Gaming PC',
    model: 'Predator X',
    sku: 'COMP-007',
    category: productCategory.COMPUTERS,
    price: 1800.0,
    cost: 1200.0,
    brand: 'Acer',
    stock: 6,
    description: 'High-end gaming desktop with RTX graphics',
    status: productStatus.ACTIVE,
    suppliers: 'supplier_07',
    entryDate: new Date('2026-02-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/gaming-pc.jpg',
    saleDate: new Date('2026-04-05'),
  },
  {
    id: 8,
    name: 'Microwave Oven',
    model: 'QuickHeat 300',
    sku: 'APPL-008',
    category: productCategory.APPLIANCES,
    price: 200.0,
    cost: 120.0,
    brand: 'Panasonic',
    stock: 15,
    description: 'Compact microwave oven with grill function',
    status: productStatus.ACTIVE,
    suppliers: 'supplier_08',
    entryDate: new Date('2026-02-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/microwave.jpg',
    saleDate: new Date('2026-04-10'),
  },
  {
    id: 9,
    name: 'Smartphone',
    model: 'iPhone 17',
    sku: 'PHONE-009',
    category: productCategory.PHONES,
    price: 1400.0,
    cost: 950.0,
    brand: 'Apple',
    stock: 0,
    description: 'Latest iPhone with advanced camera system',
    status: productStatus.NEEDS_ORDER,
    suppliers: 'supplier_09',
    entryDate: new Date('2026-02-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/iphone17.jpg',
    saleDate: new Date('2026-04-15'),
  },
  {
    id: 10,
    name: 'Dining Table',
    model: 'WoodClassic',
    sku: 'FURN-010',
    category: productCategory.FURNITURE,
    price: 700.0,
    cost: 400.0,
    brand: 'Ikea',
    stock: 8,
    description: 'Solid wood dining table for six people',
    status: productStatus.PENDING_ARRIVAL,
    suppliers: 'supplier_10',
    entryDate: new Date('2026-02-25'),
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://example.com/dining-table.jpg',
    saleDate: new Date('2026-04-20'),
  },
];

@Injectable()
export class ProductsRepository {
  findAll() {
    return products;
  }

  findOne(id: number) {
    return products.find((product) => product.id === id);
  }

  create(product: CreateProductDto) {
    return `Este metodo crea un nuevo producto`;
  }

  update(id: string, product: UpdateProductDto) {
    return `Este metodo actualiza un producto existente`;
  }

  remove(id: string) {
    const numericId = Number(id);
    const index = products.findIndex((p) => p.id === numericId);
    if (index === -1) return null;

    // Soft delete: marcamos como INACTIVE
    products[index].status = productStatus.INACTIVE;
    products[index].updatedAt = new Date();

    return products[index];
  }
}
