import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SchemaStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('service_onboarding_schema')
export class ServiceOnboardingSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_key', type: 'varchar' })
  serviceId: string;

  @Column({ name: 'schema_key', type: 'varchar' })
  schemaKey: string;

  @Column({ name: 'max_assets_allowed', type: 'integer' })
  maxAssetsAllowed: number;

  @Column({ name: 'schema_version', type: 'varchar' })
  schemaVersion: string;

  @Column({ type: 'enum', enum: SchemaStatus, default: SchemaStatus.DRAFT })
  status: SchemaStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
