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

  async findByLocationCodes(locationCodes: string[]): Promise<LocationService[]> {
    if (locationCodes.length === 0) return [];
    return this.repository.find({
      where: { location_code: In(locationCodes), isActive: true },
    });
  }

  async findByServiceKey(serviceKey: string): Promise<LocationService[]> {
    return this.repository.find({
      where: { service_key: serviceKey, isActive: true },
    });
  }
}
