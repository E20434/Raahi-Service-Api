import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ServiceConfigService } from './service.service';
import { ServicesByLocationResponse } from './dtos/services-by-location.dto';

@Controller('api/services')
export class ServiceConfigController {
  constructor(private readonly serviceConfigService: ServiceConfigService) {}

  @Get('by-location/:locationId')
  async getServicesByLocation(
    @Param('locationId') locationId: string,
  ): Promise<ServicesByLocationResponse> {
    try {
      return await this.serviceConfigService.getServicesByLocation(locationId);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('An unknown error occurred');
    }
  }
}
