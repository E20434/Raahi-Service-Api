import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
//import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceConfigByIdDto } from './dtos/create-service-config-by-id.dto';
import { ServiceOnboardingSchema, SchemaStatus, ServiceSpecialField, AssetType } from './entities';
import { Service } from '../service/entities/service.entity';

@Injectable()
export class SchemaService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}



  async createServiceConfigById(dto: CreateServiceConfigByIdDto) {
    const { service_key, meta, special_elements = [], asset_types = [] } = dto;
    // Verify service exists by service_key
    const service = await this.serviceRepo.findOne({
      where: { serviceKey: service_key }
    });
    if (!service) {
      throw new NotFoundException(`Service with key '${service_key}' not found`);
    }
    // Auto-generate schema_key
    const schemaKey = `${service.serviceKey}_v${meta.schema_version}`;

    // Transaction to insert all records
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create Schema
      const schema = queryRunner.manager.create(ServiceOnboardingSchema, {
        serviceId: service.id,
        schemaKey: schemaKey,
        schemaVersion: meta.schema_version,
        maxAssetsAllowed: meta.rules.max_assets_allowed,
        status: SchemaStatus.DRAFT,
      });
      const savedSchema = await queryRunner.manager.save(schema);

      // Create Special Fields
      const specialFields = special_elements.map((el) => {
        return queryRunner.manager.create(ServiceSpecialField, {
          schemaId: savedSchema.id,
          entityType: el.entity_type,
          entityId: el.entity_id,
          title: el.title,
          description: el.description,
          fieldsJson: el.fields,
        });
      });
      if (specialFields.length > 0) {
        await queryRunner.manager.save(specialFields);
      }

      // Create Asset Types
      const assetEntities = asset_types.map((asset, index) => {
        return queryRunner.manager.create(AssetType, {
          schemaId: savedSchema.id,
          assetTypeId: asset.asset_type_id,
          label: asset.label,
          description: asset.description,
          assetFieldsJson: asset.fields,
          displayOrder: index,
        });
      });
      if (assetEntities.length > 0) {
        await queryRunner.manager.save(assetEntities);
      }

      await queryRunner.commitTransaction();

      return {
        schema_id: savedSchema.id,
        service_id: service.id,
        schema_key: schemaKey,
        status: savedSchema.status,
        created_at: savedSchema.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
