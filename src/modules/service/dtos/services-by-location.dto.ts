export class AvailableLocationDto {
  location_service_id: string;
  location_code: string;
  location_name: string;
  location_type: string;
}

export class ServiceDto {
  service_id: string;
  service_key: string;
  service_name: string;
  service_description: string;
  available_locations: AvailableLocationDto[];
}

export class CategoryDto {
  category_id: string;
  category_key: string;
  category_name: string;
  services: ServiceDto[];
}

export class LocationDto {
  location_code: string;
  name: string;
  type: string;
}

export class ServicesByLocationResponse {
  selected_location: LocationDto;
  categories: CategoryDto[];
}
