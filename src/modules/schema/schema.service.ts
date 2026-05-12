import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOnboardingSchema, SchemaStatus, ServiceSpecialField, AssetType } from './entities';
import { Service } from '../service/entities/service.entity';
import { LocationService } from '../service/entities/location-service.entity';
import { ResourceNotFoundException, BadRequestException } from '../../common/exceptions/custom.exception';

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
