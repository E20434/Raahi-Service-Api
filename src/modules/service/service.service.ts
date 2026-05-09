import { Injectable } from '@nestjs/common';
import { CategoryRepository, LocationRepository, ServiceRepository, LocationServiceRepository } from './repositories';
import { ServicesByLocationResponse, CategoryDto, LocationDto } from './dtos/services-by-location.dto';
import { Location } from './entities';

@Injectable()
export class ServiceConfigService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly locationServiceRepository: LocationServiceRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getServicesByLocation(locationId: string): Promise<ServicesByLocationResponse> {
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new Error(`Location with id ${locationId} not found`);
    }

    const locationServices = await this.locationServiceRepository.findByLocationId(locationId);
    if (locationServices.length === 0) {
      return {
        selected_location: this.mapLocationToDto(location),
        categories: [],
      };
    }

    const serviceIds = locationServices.map(ls => ls.serviceId);
    const services = await this.serviceRepository.findByIds(serviceIds);


    const categoryIds = [...new Set(services.map(s => s.categoryId))];
    const categories = await this.categoryRepository.findByIds(categoryIds);

    const locationServiceMap = new Map<string, any>(
      locationServices.map(ls => [ls.serviceId, ls]),
    );

    const categoriesWithServices: CategoryDto[] = categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(category => ({
        category_id: category.id,
        category_key: category.categoryKey,
        category_name: category.name,
        services: services
          .filter(s => s.categoryId === category.id)
          .filter(s => locationServiceMap.has(s.id))
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(service => {
            const locationService = locationServiceMap.get(service.id)!;
            return {
              location_service_id: locationService.id,
              service_id: service.id,
              service_key: service.serviceKey,
              service_name: service.name,
              service_description: service.description,
            };
          }),
      }));

    return {
      selected_location: this.mapLocationToDto(location),
      categories: categoriesWithServices,
    };
  }

  private mapLocationToDto(location: Location): LocationDto {
    return {
      id: location.id,
      name: location.name,
      type: location.type,
    };
  }
}
