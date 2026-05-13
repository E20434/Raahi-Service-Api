import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Service } from './service.entity';
import { Location } from './location.entity';
import { ServiceOnboardingSchema } from 'src/modules/schema/entities';
// import {} from 'src/modules/÷schema'

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

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_code' })
  location: Location;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_key' })
  service: Service;

  @ManyToOne(() => ServiceOnboardingSchema)
  @JoinColumn({ name: 'onboarding_schema_id' })
  onboardingSchema: ServiceOnboardingSchema;
}
