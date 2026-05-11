import { Controller, Post, Get, Body, Query, ValidationPipe, UsePipes, Param } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateServiceConfigByIdDto } from './dtos/create-service-config-by-id.dto';

@Controller('api/service-config')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}


  @Post('by-service-key')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createServiceConfigByKey(@Body() createDto: CreateServiceConfigByIdDto) {
    return this.schemaService.createServiceConfigById(createDto);
  }

  @Get('by-location-service/:locationServiceId')
  async getServiceConfigByLocationServiceId(
    @Param('locationServiceId') locationServiceId: string,
  ) {
    return this.schemaService.getServiceConfigByLocationServiceId(locationServiceId);
  }
}
