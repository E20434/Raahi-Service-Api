import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VendorServiceStatus } from '../enums/vendor-service.enum';
import { VendorServiceEntity } from './vendor-service.entity';

@Entity('vendor_special_data')
export class VendorSpecialDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_url' })
  documentUrl: string;

  @Column({ name: 'expiry_date' })
  expiryDate: Date;

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
