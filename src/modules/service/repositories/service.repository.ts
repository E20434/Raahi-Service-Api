import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Service } from '../entities';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repository: Repository<Service>,
  ) {}

  async findByIds(ids: string[]): Promise<Service[]> {
    return this.repository.find({
      where: { service_key: In(ids), isActive: true },
    });
  }
}
