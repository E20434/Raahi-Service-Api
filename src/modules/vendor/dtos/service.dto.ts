import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AssetType, VendorServiceStatus } from '../enums/vendor-service.enum';
import { Type } from 'class-transformer';

export class AssetInputDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsNumber()
  capacity: number;

  @IsString()
  @IsOptional()
  attributes?: string;
}

export class SpecialAttributeInputDto {
  @IsString()
  @IsNotEmpty()
  documentUrl: string;

  @IsDateString()
  expiryDate: Date;

  @IsString()
  @IsOptional()
  attributes?: string;
}

export class OfferedServiceInputDto {
  @IsString()
  @IsNotEmpty()
  serviceKey: string;

  @IsString()
  @IsNotEmpty()
  servicePitch: string;

  @IsString()
  @IsNotEmpty()
  attributes: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SpecialAttributeInputDto)
  @IsOptional()
  specialAttributes?: SpecialAttributeInputDto[];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => AssetInputDto)
  assets?: AssetInputDto[];
}

export class ServiceRegistrationInputDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfferedServiceInputDto)
  services: OfferedServiceInputDto[];
}

export class VendorAssetDto {
  id: string;
  assetType: AssetType;
  capacity: number;
  attributes?: string;
  verificationStatus: VendorServiceStatus;
  reviewedAt?: Date;
  reviewNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class VendorSpecialDataDto {
  id: string;
  documentUrl: string;
  expiryDate: Date;
  attributes?: string;
  verificationStatus: VendorServiceStatus;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class VendorServiceDto {
  id: string;
  servicePitch: string;
  attributes?: string;
  status: VendorServiceStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  assets: VendorAssetDto[];
  specialData: VendorSpecialDataDto[];
}
