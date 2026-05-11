import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';
import { ServiceOnboardingSchema, ServiceSpecialField, AssetType } from './entities';
import { Service } from '../service/entities/service.entity';
import { LocationService } from '../service/entities/location-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceOnboardingSchema,
      ServiceSpecialField,
      AssetType,
      Service,
      LocationService,
    ]),
  ],
  controllers: [SchemaController],
  providers: [SchemaService],
})
export class SchemaModule {}
