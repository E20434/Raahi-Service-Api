import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorEntity } from '../entities/vendor.entity';
import { In, Repository } from 'typeorm';
import { VendorDto, VendorCreateRequestDto } from '../dtos/vendor.dto';
import { ServiceConfigService } from 'src/modules/service/service.service';
import { VendorServiceEntity } from '../entities/vendor-service.entity';
import { VendorAssetEntity } from '../entities/vendor-asset.entity';
import { VendorSpecialDataEntity } from '../entities/vendor-special-data.entity';
import {
  ServiceRegistrationInputDto,
  VendorAssetDto,
  VendorServiceDto,
  VendorSpecialDataDto,
} from '../dtos/service.dto';
import { LocationService } from 'src/modules/service/entities';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>,
    @InjectRepository(VendorServiceEntity)
    private readonly vendorServiceRepository: Repository<VendorServiceEntity>,
    private readonly serviceConfigService: ServiceConfigService,
  ) {}

  public async createVendor(
    details: VendorCreateRequestDto,
  ): Promise<VendorDto> {
    const { exactLocation, hourlyRate, dailyRate, ...newVendorDetails } =
      details;

    if (!hourlyRate && !dailyRate) {
      throw new BadRequestException('Vendor should set hourly or daily rate');
    }
    const vendor = await this.vendorRepository.save({
      ...newVendorDetails,
      hourlyRate,
      dailyRate,
      exactLocation: this.parseAttributes(exactLocation || ''),
    } as VendorEntity);

    return this.toDto(vendor);
  }

  public async getVendorDetails(id: string): Promise<VendorDto | null> {
    const vendor = await this.vendorRepository.findOneBy({ id });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }
    return this.toDto(vendor);
  }

  public async serviceRegistration(
    input: ServiceRegistrationInputDto,
  ): Promise<VendorServiceDto[]> {
    const { vendorId, services } = input;

    await this.getVendorDetails(vendorId);

    const serviceMap: Record<string, LocationService | undefined> = {};
    services.forEach(({ serviceKey, assets, specialAttributes }) => {
      if (
        (!assets || assets.length < 1) &&
        (!specialAttributes || specialAttributes.length < 1)
      ) {
        throw new UnprocessableEntityException(
          'Service should contains 1 asset or special attributes',
        );
      }
      serviceMap[serviceKey] = undefined;
    });

    const locationServices =
      await this.serviceConfigService.getLocationServiceByKeys(
        Object.keys(serviceMap),
      );
    locationServices.forEach((service) => {
      serviceMap[service.service_location_key] = service;
    });

    const alreadyRegisteredServices = await this.vendorServiceRepository.find({
      where: { vendorId, serviceLocationKey: In(Object.keys(serviceMap)) },
    });
    if (alreadyRegisteredServices.length > 0) {
      throw new UnprocessableEntityException(
        'Cannot register for same service twice',
      );
    }

    const vendorServices: Partial<VendorServiceEntity>[] = [];
    for (const serviceOffered of services) {
      const service = serviceMap[serviceOffered.serviceKey];
      const vendorService = {
        servicePitch: serviceOffered.servicePitch,
        attributes: this.parseAttributes(serviceOffered.attributes),
        submittedAt: new Date(),
        vendorId,
        serviceLocationKey: service?.service_location_key,
        onboardingSchemaId: service?.onboardingSchemaId,
      } as Partial<VendorServiceEntity>;

      if (
        serviceOffered?.specialAttributes &&
        serviceOffered.specialAttributes.length > 0
      ) {
        vendorService.specialData = serviceOffered.specialAttributes.map(
          ({ documentUrl, expiryDate, attributes }) =>
            ({
              documentUrl,
              expiryDate,
              attributes: this.parseAttributes(attributes || ''),
            }) as VendorSpecialDataEntity,
        );
      }

      if (serviceOffered?.assets && serviceOffered.assets.length > 0) {
        vendorService.assets = serviceOffered.assets.map(
          ({ type, capacity, attributes }) =>
            ({
              assetType: type,
              capacity,
              attributes: this.parseAttributes(attributes || ''),
            }) as VendorAssetEntity,
        );
      }
      vendorServices.push(vendorService);
    }

    const registeredServices =
      await this.vendorServiceRepository.save(vendorServices);
    return this.toVendorServiceDtos(registeredServices);
  }

  private toDto(entity: VendorEntity): VendorDto {
    const { exactLocation, ...vendorDetails } = entity;

    return {
      ...vendorDetails,
      exactLocation: JSON.stringify(exactLocation),
    };
  }

  private toVendorSpecialDataDto(
    entity: VendorSpecialDataEntity,
  ): VendorSpecialDataDto {
    const { attributes, ...data } = entity;
    return {
      ...data,
      attributes: attributes ? JSON.stringify(attributes) : undefined,
    };
  }

  private toVendorAssetDto(entity: VendorAssetEntity): VendorAssetDto {
    const { attributes, ...data } = entity;
    return {
      ...data,
      attributes: attributes ? JSON.stringify(attributes) : undefined,
    };
  }

  private toVendorServiceDto(entity: VendorServiceEntity): VendorServiceDto {
    const { attributes, assets, specialData, ...data } = entity;
    return {
      ...data,
      attributes: attributes ? JSON.stringify(attributes) : undefined,
      assets: assets?.map((asset) => this.toVendorAssetDto(asset)),
      specialData: specialData?.map((specialData) =>
        this.toVendorSpecialDataDto(specialData),
      ),
    };
  }

  private toVendorServiceDtos(
    entities: VendorServiceEntity[],
  ): VendorServiceDto[] {
    return entities.map((entity) => this.toVendorServiceDto(entity));
  }

  private parseAttributes(attributes: string): Record<string, any> {
    if (!attributes || attributes === '') {
      return {};
    }

    try {
      return JSON.parse(attributes);
    } catch (err) {
      Logger.error(`Failed to parse attributes error: ${err}`);
      throw new BadRequestException('Failed to pass attributes');
    }
  }
}
