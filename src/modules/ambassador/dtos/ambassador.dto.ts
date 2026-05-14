import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OnboardingStatus } from '../../vendor/enums/vendor.enum';

export class CreateAmbassadorDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  payout_details?: string;
}

export class AmbassadorResponseDto {
  amb_id: string;
  full_name: string;
  ref_code: string;
  email: string;
  phone?: string;
  payout_details?: string;
  is_active: boolean;
  created_at: Date;
}

export class AmbassadorVendorRegisterDto {
  @IsString()
  @IsNotEmpty()
  ref_code: string;

  @IsString()
  @IsNotEmpty()
  business_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class AmbassadorVendorResponseDto {
  id: string;
  email: string;
  business_name: string;
  ref_code_used: string;
  onboarding_status: OnboardingStatus;
  created_at: Date;
}

export class ReferralVendorDto {
  business_name: string;
  status: OnboardingStatus;
  registered_at: Date;
}

export class ReferralsDashboardResponseDto {
  ref_code: string;
  total: number;
  vendors: ReferralVendorDto[];
}
