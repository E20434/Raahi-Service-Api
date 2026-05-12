import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Location } from '../entities';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async findByCode(code: string): Promise<Location | null> {
    return this.repository.findOne({
      where: { location_code: code, isActive: true },
    });
  }

  async findByCodes(codes: string[]): Promise<Location[]> {
    if (codes.length === 0) return [];
    return this.repository.find({
      where: { location_code: In(codes), isActive: true },
    });
  }

  async getAllChildLocationCodes(parentLocationCode: string): Promise<string[]> {
    const allCodes: string[] = [parentLocationCode];
    const toProcess: string[] = [parentLocationCode];

    while (toProcess.length > 0) {
      const currentLocationCode = toProcess.shift()!;
      
      const children = await this.repository.find({
        where: { parent_location_code: currentLocationCode, isActive: true },
      });

      for (const child of children) {
        allCodes.push(child.location_code);
        toProcess.push(child.location_code);
      }
    }

    return allCodes;
  }
}
