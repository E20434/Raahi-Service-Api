import {
  IsString,
  IsInt,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class RulesDto {
  @IsInt()
  max_assets_allowed!: number;
}

class MetaDto {
  @IsString()
  schema_version: string;

  @ValidateNested()
  @Type(() => RulesDto)
  rules: RulesDto;
}

class ValidationDto {
  @IsOptional()
  required?: boolean;

  @IsOptional()
  @IsInt()
  min?: number;

  @IsOptional()
  @IsInt()
  max?: number;
}

class FieldDto {
  @IsString()
  field_id: string;

  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsArray()
  accepted_formats?: string[];

  @IsOptional()
  @IsInt()
  max_size_mb?: number;

  @ValidateNested()
  @Type(() => ValidationDto)
  validation: ValidationDto;

  @IsOptional()
  @IsString()
  placeholder?: string;
}

class SpecialElementDto {
  @IsString()
  entity_type: string;

  @IsString()
  entity_id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}

class AssetTypeDto {
  @IsString()
  asset_type_id: string;

  @IsString()
  label: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}

export class CreateServiceConfigByIdDto {
  @IsString()
  service_key: string;

  @ValidateNested()
  @Type(() => MetaDto)
  meta: MetaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialElementDto)
  special_elements?: SpecialElementDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetTypeDto)
  asset_types?: AssetTypeDto[];
}
