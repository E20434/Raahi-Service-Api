import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('asset_type')
export class AssetType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schema_id', type: 'uuid' })
  schemaId: string;

  @Column({ name: 'asset_type_id', type: 'varchar' })
  assetTypeId: string;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'asset_fields_json', type: 'jsonb' })
  assetFieldsJson: any;

  @Column({ name: 'display_order', type: 'integer' })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
