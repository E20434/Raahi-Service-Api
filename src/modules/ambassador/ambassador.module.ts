import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import { AmbassadorController } from './ambassador.controller';
import { AmbassadorService } from './ambassador.service';

@Module({
  imports: [TypeOrmModule.forFeature([AmbassadorEntity, VendorEntity])],
  controllers: [AmbassadorController],
  providers: [AmbassadorService],
})
export class AmbassadorModule {}
