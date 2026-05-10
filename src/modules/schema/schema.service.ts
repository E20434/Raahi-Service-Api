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
    @InjectRepository(ServiceOnboardingSchema)
    private schemaRepo: Repository<ServiceOnboardingSchema>,
    @InjectRepository(ServiceSpecialField)
    private specialFieldRepo: Repository<ServiceSpecialField>,
    @InjectRepository(AssetType)
    private assetTypeRepo: Repository<AssetType>,
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

  async getServiceConfigByKey(service_key: string) {
    // Verify service exists by service_key
    const service = await this.serviceRepo.findOne({
      where: { serviceKey: service_key }
    });
    if (!service) {
      throw new NotFoundException(`Service with key '${service_key}' not found`);
    }

    // Fetch all schemas for this service
    const schemas = await this.schemaRepo.find({
      where: { serviceId: service.id, isActive: true },
      order: { createdAt: 'DESC' }
    });

    if (schemas.length === 0) {
      return {
        service_key,
        service_id: service.id,
        schemas: []
      };
    }

    // Fetch special fields and asset types for each schema
    const schemasWithDetails = await Promise.all(
      schemas.map(async (schema) => {
        const specialFields = await this.specialFieldRepo.find({
          where: { schemaId: schema.id, isActive: true }
        });

        const assetTypes = await this.assetTypeRepo.find({
          where: { schemaId: schema.id, isActive: true }
        });

        // Format special elements
        const special_elements = specialFields.map((field) => ({
          entity_type: field.entityType,
          entity_id: field.entityId,
          title: field.title,
          description: field.description,
          fields: field.fieldsJson,
        }));

        // Format asset types
        const asset_types_formatted = assetTypes.map((asset) => ({
          asset_type_id: asset.assetTypeId,
          label: asset.label,
          description: asset.description,
          fields: asset.assetFieldsJson,
        }));

        return {
          schema_id: schema.id,
          schema_key: schema.schemaKey,
          schema_version: schema.schemaVersion,
          max_assets_allowed: schema.maxAssetsAllowed,
          status: schema.status,
          special_elements,
          asset_types: asset_types_formatted,
          created_at: schema.createdAt,
          updated_at: schema.updatedAt,
        };
      })
    );

    return {
      service_key,
      service_id: service.id,
      schemas: schemasWithDetails
    };
  }
}
