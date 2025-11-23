import { Injectable } from '@nestjs/common';
import { CreateProductRequest, Product } from '@repo/types';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];
  create(createProductDto: CreateProductRequest) {
    const product: Product = {
      ...createProductDto,
      id: Date.now()
    };
    this.products.push(product);
    return product;
  }

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
