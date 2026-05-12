import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LocationService } from '../entities';

@Injectable()
export class LocationServiceRepository {
  constructor(
    @InjectRepository(LocationService)
    private readonly repository: Repository<LocationService>,
  ) {}

  async findByLocationIds(locationIds: string[]): Promise<LocationService[]> {
    if (locationIds.length === 0) return [];
    return this.repository.find({
      where: { location_code: In(locationIds), isActive: true },
    });
  }

  async findByServiceId(serviceId: string): Promise<LocationService[]> {
    return this.repository.find({
      where: { service_key: serviceId, isActive: true },
    });
  }
}
