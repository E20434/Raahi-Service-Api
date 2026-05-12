import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender, VendorStatus } from '../enums/vendor.enum';
import { Type } from 'class-transformer';

export class VendorLanguages {
  @IsString()
  language: string;

  @IsString()
  proficiency: string;
}

export class VendorCreateRequestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  preferedName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  exactLocation?: string;

  @IsString()
  shortBio: string;

  @IsArray({})
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => VendorLanguages)
  languages: VendorLanguages[];

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;
}

export class VendorDto {
  id: string;
  firstName: string;
  lastName: string;
  preferedName: string;
  gender: Gender;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  exactLocation: string;
  shortBio: string;
  languages: VendorLanguages[];
  status: VendorStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
