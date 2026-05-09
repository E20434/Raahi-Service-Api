import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('location_service')
export class LocationService {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'onboarding_schema_id', type: 'uuid', nullable: true })
  onboardingSchemaId: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
