import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorEntity } from './entities/vendor.entity';
import { VendorController } from './controllers/vendor.controller';
import { VendorService } from './services/vendor.service';
import { ServiceModule } from '../service/service.module';
import { VendorServiceEntity } from './entities/vendor-service.entity';
import { VendorSpecialDataEntity } from './entities/vendor-special-data.entity';
import { VendorAssetEntity } from './entities/vendor-asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorEntity,
      VendorServiceEntity,
      VendorSpecialDataEntity,
      VendorAssetEntity,
    ]),
    ServiceModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
