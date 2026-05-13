import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AssetType, VendorServiceStatus } from '../enums/vendor-service.enum';
import { VendorServiceEntity } from './vendor-service.entity';

@Entity('vendor_asset')
export class VendorAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_type' })
  assetType: AssetType;

  @Column({ name: 'capacity' })
  capacity: number;

  @Column({ name: 'attributes', type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @Column({
    name: 'verification_status',
    default: VendorServiceStatus.SUBMITTED,
  })
  verificationStatus: VendorServiceStatus;

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

  @ManyToOne(() => VendorServiceEntity)
  @JoinColumn({ name: 'vendor_service_id' })
  vendorService: VendorServiceEntity;

  @Column({ name: 'vendor_service_id' })
  vendorServiceId: string;
}
