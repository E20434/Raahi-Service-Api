import { Injectable } from '@nestjs/common';
import { CategoryRepository, LocationRepository, ServiceRepository, LocationServiceRepository } from './repositories';
import { ServicesByLocationResponse, CategoryDto, LocationDto, AvailableLocationDto } from './dtos/services-by-location.dto';
import { Location } from './entities';
import { ResourceNotFoundException } from '../../common/exceptions/custom.exception';

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
      throw new ResourceNotFoundException(`Location with code '${locationId}' not found`);
    }

    // Get all child location codes (including the parent location)
    const allLocationIds = await this.locationRepository.getAllChildLocationIds(locationId);

    // Find all location services for these locations
    const locationServices = await this.locationServiceRepository.findByLocationIds(allLocationIds);
    if (locationServices.length === 0) {
      return {
        selected_location: this.mapLocationToDto(location),
        categories: [],
      };
    }

    // Get unique service keys
    const serviceIds = [...new Set(locationServices.map(ls => ls.service_key))];
    const services = await this.serviceRepository.findByIds(serviceIds);

    // Get all locations involved
    const allLocationIdsInServices = [...new Set(locationServices.map(ls => ls.location_code))];
    const locationsMap = new Map<string, Location>();
    const locations = await this.locationRepository.findByIds(allLocationIdsInServices);
    locations.forEach(loc => locationsMap.set(loc.location_code, loc));

    // Get categories
    const categoryIds = [...new Set(services.map(s => s.category_key))];
    const categories = await this.categoryRepository.findByIds(categoryIds);

    // Build a map of service key -> all location services for that service
    const serviceLocationServicesMap = new Map<string, any[]>();
    for (const service of services) {
      const allServiceLocationServices = await this.locationServiceRepository.findByServiceId(service.service_key);
      serviceLocationServicesMap.set(service.service_key, allServiceLocationServices);
    }

    // Convert allLocationIds to a Set for faster lookup
    const allLocationIdsSet = new Set(allLocationIds);

    const categoriesWithServices: CategoryDto[] = categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(category => ({
        category_id: category.category_key,
        category_key: category.category_key,
        category_name: category.name,
        services: services
          .filter(s => s.category_key === category.category_key)
          .filter(s => locationServices.some(ls => ls.service_key === s.service_key))
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(service => {
            const allServiceLocationServices = serviceLocationServicesMap.get(service.service_key) || [];
            
            // Filter available_locations to only include locations within the selected location hierarchy
            const available_locations: AvailableLocationDto[] = allServiceLocationServices
              .filter(ls => allLocationIdsSet.has(ls.location_code))
              .map(ls => {
                const loc = locationsMap.get(ls.location_code);
                return {
                  location_service_key: ls.service_location_key,
                  location_code: ls.location_code,
                  location_name: loc?.name || 'Unknown',
                  location_type: loc?.type || 'Unknown',
                };
              })
              .sort((a, b) => a.location_name.localeCompare(b.location_name));

            return {
              service_id: service.service_key,
              service_key: service.service_key,
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
      location_code: location.location_code,
      name: location.name,
      type: location.type,
    };
  }
}
