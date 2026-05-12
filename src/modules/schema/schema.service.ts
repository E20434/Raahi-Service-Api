import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateServiceConfigByIdDto } from './dtos/create-service-config-by-id.dto';
import { ServiceOnboardingSchema, SchemaStatus, ServiceSpecialField, AssetType } from './entities';
import { Service } from '../service/entities/service.entity';
import { LocationService } from '../service/entities/location-service.entity';
import { ResourceNotFoundException, BadRequestException } from '../../common/exceptions/custom.exception';

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
    @InjectRepository(LocationService)
    private locationServiceRepo: Repository<LocationService>,
  ) {}



  async createServiceConfigById(dto: CreateServiceConfigByIdDto) {
    const { service_key, meta, special_elements = [], asset_types = [] } = dto;
    // Verify service exists by service_key
    const service = await this.serviceRepo.findOne({
      where: { service_key: service_key }
    });
    if (!service) {
      throw new ResourceNotFoundException(`Service with key '${service_key}' not found`);
    }
    // Auto-generate schema_key
    const schemaKey = `${service.service_key}_v${meta.schema_version}`;

    // Transaction to insert all records
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create Schema
      const schema = queryRunner.manager.create(ServiceOnboardingSchema, {
        serviceId: service.service_key,
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
        service_key: service.service_key,
        schema_key: schemaKey,
        status: savedSchema.status,
        created_at: savedSchema.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create service config',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getServiceConfigByLocationServiceId(serviceLocationKey: string) {
    // Find LocationService by id
    const locationService = await this.locationServiceRepo.findOne({
      where: { service_location_key: serviceLocationKey}
    });

    if (!locationService) {
      throw new ResourceNotFoundException(
        `LocationService with id '${serviceLocationKey}' not found`,
      );
    }

    // Check if onboarding_schema_id exists
    if (!locationService.onboardingSchemaId) {
      throw new ResourceNotFoundException(
        `No onboarding schema assigned to this location service`,
      );
    }

    // Fetch the schema
    const schema = await this.schemaRepo.findOne({
      where: { 
        id: locationService.onboardingSchemaId,
        isActive: true 
      }
    });

    if (!schema) {
      throw new ResourceNotFoundException(
        `Schema with id '${locationService.onboardingSchemaId}' not found`,
      );
    }

    // Check if schema status is PUBLISHED
    if (schema.status !== SchemaStatus.PUBLISHED) {
      throw new BadRequestException(
        `Schema is not published. Current status: ${schema.status}`,
      );
    }

    // Fetch service to get service_type
    const service = await this.serviceRepo.findOne({
      where: { service_key: schema.serviceId }
    });

    if (!service) {
      throw new ResourceNotFoundException(`Service not found for schema`);
    }

    // Fetch special fields and asset types
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

    // Return in the specified format
    return {
      meta: {
        service_type: service.name, // Using service name as service_type, adjust if needed
        schema_version: schema.schemaVersion,
        rules: {
          max_assets_allowed: schema.maxAssetsAllowed
        }
      },
      special_elements,
      asset_types: asset_types_formatted
    };
  }
}
