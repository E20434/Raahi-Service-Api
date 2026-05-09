export class ServiceDto {
  location_service_id: string;
  service_id: string;
  service_key: string;
  service_name: string;
  service_description: string;
}

export class CategoryDto {
  category_id: string;
  category_key: string;
  category_name: string;
  services: ServiceDto[];
}

export class LocationDto {
  id: string;
  name: string;
  type: string;
}

export class ServicesByLocationResponse {
  selected_location: LocationDto;
  categories: CategoryDto[];
}
