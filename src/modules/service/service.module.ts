import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceConfigController } from './service.controller';
import { ServiceConfigService } from './service.service';
import { Category, Location, Service, LocationService } from './entities';
import {
  CategoryRepository,
  LocationRepository,
  ServiceRepository,
  LocationServiceRepository,
} from './repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Location, Service, LocationService]),
  ],
  controllers: [ServiceConfigController],
  providers: [
    ServiceConfigService,
    CategoryRepository,
    LocationRepository,
    ServiceRepository,
    LocationServiceRepository,
  ],
  exports: [ServiceConfigService],
})
export class ServiceModule {}
