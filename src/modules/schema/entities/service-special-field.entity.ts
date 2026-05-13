import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceOnboardingSchema } from './service-onboarding-schema.entity';

@Entity('service_special_field')
export class ServiceSpecialField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schema_id', type: 'uuid' })
  schemaId: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  entityId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'fields_json', type: 'jsonb' })
  fieldsJson: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => ServiceOnboardingSchema, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'schema_id' })
  schema: ServiceOnboardingSchema;
}
