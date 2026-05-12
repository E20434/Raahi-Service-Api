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

  async findById(id: string): Promise<Location | null> {
    return this.repository.findOne({
      where: { location_code: id, isActive: true },
    });
  }

  async findByIds(ids: string[]): Promise<Location[]> {
    if (ids.length === 0) return [];
    return this.repository.find({
      where: { location_code: In(ids), isActive: true },
    });
  }

  async getAllChildLocationIds(parentId: string): Promise<string[]> {
    const allIds: string[] = [parentId];
    const toProcess: string[] = [parentId];

    while (toProcess.length > 0) {
      const currentId = toProcess.shift()!;
      
      const children = await this.repository.find({
        where: { parent_location_code: currentId, isActive: true },
      });

      for (const child of children) {
        allIds.push(child.location_code);
        toProcess.push(child.location_code);
      }
    }

    return allIds;
  }
}
