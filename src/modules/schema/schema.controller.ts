import { Controller, Post, Get, Body, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { SchemaService } from './schema.service';
//import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceConfigByIdDto } from './dtos/create-service-config-by-id.dto';

@Controller('api/service-config')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) { }


  @Post('by-service-key')
  async createServiceConfigByKey(@Body() createDto: CreateServiceConfigByIdDto) {
    return this.schemaService.createServiceConfigById(createDto);
  }

  @Get('by-service-key')
  async getServiceConfigByKey(@Query('service_key') service_key: string) {
    return this.schemaService.getServiceConfigByKey(service_key);
  }
}
