import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { SchemaService } from './schema.service';
//import { CreateServiceConfigDto } from './dtos/create-service-config.dto';
import { CreateServiceConfigByIdDto } from './dtos/create-service-config-by-id.dto';

@Controller('api/service-config')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}


  @Post('by-service-key')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createServiceConfigByKey(@Body() createDto: CreateServiceConfigByIdDto) {
    return this.schemaService.createServiceConfigById(createDto);
  }
}
