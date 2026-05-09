import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { LocationService } from '../entities';

@Injectable()
export class LocationServiceRepository {
  constructor(
    @InjectRepository(LocationService)
    private readonly repository: Repository<LocationService>,
  ) {}

  async findByLocationId(locationId: string): Promise<LocationService[]> {
    return this.repository.find({
      where: { locationId, isActive: true },
    });
  }
}
