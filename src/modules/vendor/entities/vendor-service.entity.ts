import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VendorServiceStatus } from '../enums/vendor-service.enum';
import { VendorEntity } from './vendor.entity';
import { LocationService } from 'src/modules/service/entities';
import { ServiceOnboardingSchema } from 'src/modules/schema/entities';
import { VendorSpecialDataEntity } from './vendor-special-data.entity';
import { VendorAssetEntity } from './vendor-asset.entity';

@Entity('vendor_service')
export class VendorServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_pitch' })
  servicePitch: string;

  @Column({ name: 'attributes', type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @Column({ name: 'status', default: VendorServiceStatus.SUBMITTED })
  status: VendorServiceStatus;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'review_notes', nullable: true })
  reviewNotes?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => VendorEntity)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorEntity;

  @OneToOne(() => LocationService)
  @JoinColumn({ name: 'service_location_key' })
  locationService: LocationService;

  @OneToOne(() => ServiceOnboardingSchema)
  @JoinColumn({ name: 'onboarding_schema_id' })
  onboardingSchema: ServiceOnboardingSchema;

  @OneToMany(
    () => VendorSpecialDataEntity,
    (specialdata) => specialdata.vendorService,
    { cascade: ['insert', 'update'], eager: true },
  )
  specialData: VendorSpecialDataEntity[];

  @OneToMany(() => VendorAssetEntity, (asset) => asset.vendorService, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  assets: VendorAssetEntity[];

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @Column({ name: 'service_location_key' })
  serviceLocationKey: string;

  @Column({ name: 'onboarding_schema_id' })
  onboardingSchemaId: string;
}
