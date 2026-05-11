import { Injectable } from '@nestjs/common';
import { CategoryRepository, LocationRepository, ServiceRepository, LocationServiceRepository } from './repositories';
import { ServicesByLocationResponse, CategoryDto, LocationDto, AvailableLocationDto } from './dtos/services-by-location.dto';
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

    // Get all child location IDs (including the parent location)
    const allLocationIds = await this.locationRepository.getAllChildLocationIds(locationId);

    // Find all location services for these locations
    const locationServices = await this.locationServiceRepository.findByLocationIds(allLocationIds);
    if (locationServices.length === 0) {
      return {
        selected_location: this.mapLocationToDto(location),
        categories: [],
      };
    }

    // Get unique service IDs
    const serviceIds = [...new Set(locationServices.map(ls => ls.serviceId))];
    const services = await this.serviceRepository.findByIds(serviceIds);

    // Get all locations involved
    const allLocationIdsInServices = [...new Set(locationServices.map(ls => ls.locationId))];
    const locationsMap = new Map<string, Location>();
    const locations = await this.locationRepository.findByIds(allLocationIdsInServices);
    locations.forEach(loc => locationsMap.set(loc.id, loc));

    // Get categories
    const categoryIds = [...new Set(services.map(s => s.categoryId))];
    const categories = await this.categoryRepository.findByIds(categoryIds);

    // Build a map of service ID -> all location services for that service
    const serviceLocationServicesMap = new Map<string, any[]>();
    for (const service of services) {
      const allServiceLocationServices = await this.locationServiceRepository.findByServiceId(service.id);
      serviceLocationServicesMap.set(service.id, allServiceLocationServices);
    }

    // Convert allLocationIds to a Set for faster lookup
    const allLocationIdsSet = new Set(allLocationIds);

    const categoriesWithServices: CategoryDto[] = categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(category => ({
        category_id: category.id,
        category_key: category.categoryKey,
        category_name: category.name,
        services: services
          .filter(s => s.categoryId === category.id)
          .filter(s => locationServices.some(ls => ls.serviceId === s.id))
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(service => {
            const allServiceLocationServices = serviceLocationServicesMap.get(service.id) || [];
            
            // Filter available_locations to only include locations within the selected location hierarchy
            const available_locations: AvailableLocationDto[] = allServiceLocationServices
              .filter(ls => allLocationIdsSet.has(ls.locationId))
              .map(ls => {
                const loc = locationsMap.get(ls.locationId);
                return {
                  location_service_id: ls.id,
                  location_id: ls.locationId,
                  location_name: loc?.name || 'Unknown',
                  location_type: loc?.type || 'Unknown',
                };
              })
              .sort((a, b) => a.location_name.localeCompare(b.location_name));

            return {
              service_id: service.id,
              service_key: service.serviceKey,
              service_name: service.name,
              service_description: service.description,
              available_locations,
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
