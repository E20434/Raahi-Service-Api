import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import {
  CreateAmbassadorDto,
  AmbassadorResponseDto,
  AmbassadorVendorRegisterDto,
  AmbassadorVendorResponseDto,
  ReferralsDashboardResponseDto,
} from './dtos/ambassador.dto';

@Injectable()
export class AmbassadorService {
  constructor(
    @InjectRepository(AmbassadorEntity)
    private readonly ambassadorRepository: Repository<AmbassadorEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>,
  ) {}

  async createAmbassador(_dto: CreateAmbassadorDto): Promise<AmbassadorResponseDto> {
    throw new Error('not implemented');
  }

  async vendorRegistration(_dto: AmbassadorVendorRegisterDto): Promise<AmbassadorVendorResponseDto> {
    throw new Error('not implemented');
  }

  async getReferrals(_refCode: string): Promise<ReferralsDashboardResponseDto> {
    throw new Error('not implemented');
  }
}
