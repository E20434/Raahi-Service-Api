import { Controller, Get, Param } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { ResourceNotFoundException, BadRequestException } from '../../common/exceptions/custom.exception';

@Controller('api/service-config')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  /*
   * Preserved for future re-enable:
   *
   * @Post('by-service-key')
   * @UsePipes(new ValidationPipe({ transform: true }))
   * async createServiceConfigByKey(@Body() createDto: CreateServiceConfigByIdDto) {
   *   try {
   *     return await this.schemaService.createServiceConfigById(createDto);
   *   } catch (error) {
   *     if (
   *       error instanceof ResourceNotFoundException ||
   *       error instanceof BadRequestException
   *     ) {
   *       throw error;
   *     }
   *     throw new BadRequestException(
   *       error instanceof Error ? error.message : 'Failed to create service config',
   *     );
   *   }
   * }
   */

  @Get('by-location-service/:serviceLocationKey')
  async getServiceConfigByLocationServiceKey(
    @Param('serviceLocationKey') serviceLocationKey: string,
  ) {
    try {
      return await this.schemaService.getServiceConfigByLocationServiceKey(serviceLocationKey);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve service config',
      );
    }
  }
}
