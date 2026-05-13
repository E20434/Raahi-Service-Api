import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOnboardingSchema, SchemaStatus, ServiceSpecialField, AssetType } from './entities';
import { Service } from '../service/entities/service.entity';
import { LocationService } from '../service/entities/location-service.entity';
import { ResourceNotFoundException } from '../../common/exceptions/custom.exception';

@Injectable()
export class SchemaService {
  constructor(
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

  /*
   * Preserved for future re-enable:
   *
   * constructor(
   *   private dataSource: DataSource,
   *   @InjectRepository(Service)
   *   private serviceRepo: Repository<Service>,
   *   @InjectRepository(ServiceOnboardingSchema)
   *   private schemaRepo: Repository<ServiceOnboardingSchema>,
   *   @InjectRepository(ServiceSpecialField)
   *   private specialFieldRepo: Repository<ServiceSpecialField>,
   *   @InjectRepository(AssetType)
   *   private assetTypeRepo: Repository<AssetType>,
   *   @InjectRepository(LocationService)
   *   private locationServiceRepo: Repository<LocationService>,
   * ) {}
   *
   * async createServiceConfigById(dto: CreateServiceConfigByIdDto) {
   *   const { service_key, meta, special_elements = [], asset_types = [] } = dto;
   *   const service = await this.serviceRepo.findOne({
   *     where: { service_key: service_key }
   *   });
   *   if (!service) {
   *     throw new ResourceNotFoundException(`Service with key '${service_key}' not found`);
   *   }
   *
   *   const schemaKey = `${service.service_key}_v${meta.schema_version}`;
   *
   *   const queryRunner = this.dataSource.createQueryRunner();
   *   await queryRunner.connect();
   *   await queryRunner.startTransaction();
   *
   *   try {
   *     const schema = queryRunner.manager.create(ServiceOnboardingSchema, {
   *       serviceKey: service.service_key,
   *       schemaKey: schemaKey,
   *       schemaVersion: meta.schema_version,
   *       maxAssetsAllowed: meta.rules.max_assets_allowed,
   *       status: SchemaStatus.DRAFT,
   *     });
   *     const savedSchema = await queryRunner.manager.save(schema);
   *
   *     const specialFields = special_elements.map((el) => {
   *       return queryRunner.manager.create(ServiceSpecialField, {
   *         schemaId: savedSchema.id,
   *         entityType: el.entity_type,
   *         entityId: el.entity_id,
   *         title: el.title,
   *         description: el.description,
   *         fieldsJson: el.fields,
   *       });
   *     });
   *     if (specialFields.length > 0) {
   *       await queryRunner.manager.save(specialFields);
   *     }
   *
   *     const assetEntities = asset_types.map((asset, index) => {
   *       return queryRunner.manager.create(AssetType, {
   *         schemaId: savedSchema.id,
   *         assetTypeId: asset.asset_type_id,
   *         label: asset.label,
   *         description: asset.description,
   *         assetFieldsJson: asset.fields,
   *         displayOrder: index,
   *       });
   *     });
   *     if (assetEntities.length > 0) {
   *       await queryRunner.manager.save(assetEntities);
   *     }
   *
   *     await queryRunner.commitTransaction();
   *
   *     return {
   *       schema_id: savedSchema.id,
   *       service_key: service.service_key,
   *       schema_key: schemaKey,
   *       status: savedSchema.status,
   *       created_at: savedSchema.createdAt,
   *     };
   *   } catch (error) {
   *     await queryRunner.rollbackTransaction();
   *     if (error instanceof BadRequestException || error instanceof ResourceNotFoundException) {
   *       throw error;
   *     }
   *     throw new BadRequestException(
   *       error instanceof Error ? error.message : 'Failed to create service config',
   *     );
   *   } finally {
   *     await queryRunner.release();
   *   }
   * }
   */

  async getServiceConfigByLocationServiceKey(serviceLocationKey: string) {
    // Find active LocationService by service_location_key
    const locationService = await this.locationServiceRepo.findOne({
      where: {
        service_location_key: serviceLocationKey,
        isActive: true,
      }
    });

    if (!locationService) {
      throw new ResourceNotFoundException(
        `LocationService with key '${serviceLocationKey}' not found`,
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
        serviceKey: locationService.service_key,
        isActive: true 
      }
    });

    if (!schema) {
      throw new ResourceNotFoundException(
        `Schema not found for location service key '${serviceLocationKey}'`,
      );
    }

    // Check if schema status is PUBLISHED
    if (schema.status !== SchemaStatus.PUBLISHED) {
      throw new ResourceNotFoundException(
        `Published schema not found for location service key '${serviceLocationKey}'`,
      );
    }

    // Fetch service to get service_type
    const service = await this.serviceRepo.findOne({
      where: {
        service_key: schema.serviceKey,
        isActive: true,
      }
    });

    if (!service) {
      throw new ResourceNotFoundException(`Service not found for schema`);
    }

    // Fetch special fields and asset types
    const specialFields = await this.specialFieldRepo.find({
      where: { schemaId: schema.id, isActive: true },
      // TODO: Re-enable once Neon schema has the `display_order` column.
      // order: { displayOrder: 'ASC' },
    });

    const assetTypes = await this.assetTypeRepo.find({
      where: { schemaId: schema.id, isActive: true },
      // TODO: Re-enable once Neon schema has the `display_order` column.
      // order: { displayOrder: 'ASC' },
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
          max_assets_allowed: schema.maxAssetsAllowed,
        },
      },
      special_elements,
      asset_types: asset_types_formatted,
    };
  }
}
