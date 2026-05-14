import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import { OnboardingStatus, Gender } from '../vendor/enums/vendor.enum';
import {
  CreateAmbassadorDto,
  AmbassadorResponseDto,
  AmbassadorVendorRegisterDto,
  AmbassadorVendorResponseDto,
  ReferralsDashboardResponseDto,
} from './dtos/ambassador.dto';
import {
  ConflictException,
  ResourceNotFoundException,
  BadRequestException,
  InternalServerException,
} from '../../common/exceptions/custom.exception';

@Injectable()
export class AmbassadorService {
  constructor(
    @InjectRepository(AmbassadorEntity)
    private readonly ambassadorRepository: Repository<AmbassadorEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>,
  ) {}

  async createAmbassador(dto: CreateAmbassadorDto): Promise<AmbassadorResponseDto> {
    const existing = await this.ambassadorRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Ambassador already exists');
    }

    const refCode = await this.generateRefCode(dto.full_name);

    const ambassador = await this.ambassadorRepository.save({
      fullName: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      payoutDetails: dto.payout_details,
      refCode,
      isActive: true,
    } as AmbassadorEntity);

    return this.toAmbassadorResponseDto(ambassador);
  }

  async vendorRegistration(dto: AmbassadorVendorRegisterDto): Promise<AmbassadorVendorResponseDto> {
    const ambassador = await this.ambassadorRepository.findOne({ where: { refCode: dto.ref_code } });
    if (!ambassador) {
      throw new ResourceNotFoundException('Referral code not found');
    }
    if (!ambassador.isActive) {
      throw new BadRequestException('Referral code is inactive');
    }

    const existingVendor = await this.vendorRepository.findOne({ where: { email: dto.email } });
    if (existingVendor) {
      throw new ConflictException('Vendor with this email already exists');
    }

    // Required NOT NULL vendor fields are stored as stubs here.
    // They are completed by the vendor during the PENDING→UNDER_REVIEW onboarding transition.
    const vendor = await this.vendorRepository.save({
      firstName: '',
      lastName: '',
      preferedName: dto.business_name,
      gender: Gender.Unspecified,
      dateOfBirth: new Date('1900-01-01'),
      email: dto.email,
      phoneNumber: dto.phone,
      country: '',
      city: '',
      shortBio: '',
      languages: [],
      refCodeUsed: dto.ref_code,
      businessName: dto.business_name,
      onboardingStatus: OnboardingStatus.PENDING,
    } as unknown as VendorEntity);

    return {
      id: vendor.id,
      email: vendor.email,
      business_name: vendor.businessName!,
      ref_code_used: vendor.refCodeUsed!,
      onboarding_status: vendor.onboardingStatus!,
      created_at: vendor.createdAt,
    };
  }

  async getReferrals(refCode: string): Promise<ReferralsDashboardResponseDto> {
    const ambassador = await this.ambassadorRepository.findOne({ where: { refCode } });
    if (!ambassador) {
      throw new ResourceNotFoundException('Ambassador not found');
    }

    const vendors = await this.vendorRepository.find({ where: { refCodeUsed: refCode } });

    return {
      ref_code: refCode,
      total: vendors.length,
      vendors: vendors.map((v) => ({
        business_name: v.businessName ?? '',
        status: v.onboardingStatus ?? OnboardingStatus.PENDING,
        registered_at: v.createdAt,
      })),
    };
  }

  private async generateRefCode(fullName: string): Promise<string> {
    const prefix = fullName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.floor(Math.random() * 900) + 100;
      const candidate = `${prefix}${suffix}`;
      const existing = await this.ambassadorRepository.findOne({ where: { refCode: candidate } });
      if (!existing) return candidate;
    }

    throw new InternalServerException('Failed to generate unique referral code');
  }

  private toAmbassadorResponseDto(entity: AmbassadorEntity): AmbassadorResponseDto {
    return {
      amb_id: entity.ambId,
      full_name: entity.fullName,
      ref_code: entity.refCode,
      email: entity.email,
      phone: entity.phone,
      payout_details: entity.payoutDetails,
      is_active: entity.isActive,
      created_at: entity.createdAt,
    };
  }
}
