import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '../entities';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findByKeys(keys: string[]): Promise<Category[]> {
    return this.repository.find({
      where: { category_key: In(keys), isActive: true },
    });
  }

  async findByKey(key: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { category_key: key, isActive: true },
    });
  }
}
