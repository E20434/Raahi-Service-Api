import { Controller, Get, Param } from '@nestjs/common';
import { ServiceConfigService } from './service.service';
import { ServicesByLocationResponse } from './dtos/services-by-location.dto';
import { ResourceNotFoundException, BadRequestException } from '../../common/exceptions/custom.exception';

@Controller('api/services')
export class ServiceConfigController {
  constructor(private readonly serviceConfigService: ServiceConfigService) {}

  @Get('by-location/:locationCode')
  async getServicesByLocation(
    @Param('locationCode') locationCode: string,
  ): Promise<ServicesByLocationResponse> {
    try {
      return await this.serviceConfigService.getServicesByLocation(locationCode);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }
}
