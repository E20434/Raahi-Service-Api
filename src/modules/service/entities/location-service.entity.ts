import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('location_service')
export class LocationService {
  @PrimaryColumn({ name: 'service_location_key', type: 'varchar' })
  service_location_key: string;

  @Column({ name: 'location_code', type: 'varchar' })
  location_code: string;

  @Column({ name: 'service_key', type: 'varchar' })
  service_key: string;

  @Column({ name: 'onboarding_schema_id', type: 'uuid', nullable: true })
  onboardingSchemaId: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
