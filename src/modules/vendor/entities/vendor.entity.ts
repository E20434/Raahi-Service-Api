import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VendorStatus, Gender, OnboardingStatus } from '../enums/vendor.enum';
import { VendorLanguages } from '../dtos/vendor.dto';

@Entity('vendor')
export class VendorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'prefered_name' })
  preferedName: string;

  @Column({ name: 'gender' })
  gender: Gender;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'country' })
  country: string;

  @Column({ name: 'city' })
  city: string;

  @Column({ name: 'exact_location', type: 'jsonb', nullable: true })
  exactLocation?: Record<string, any>;

  @Column({ name: 'short_bio' })
  shortBio: string;

  @Column({ name: 'languages', type: 'jsonb' })
  languages: VendorLanguages[];

  @Column({ name: 'status', default: VendorStatus.PENDING })
  status: VendorStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'daily_rate', type: 'numeric', nullable: true })
  dailyRate?: number;

  @Column({ name: 'hourly_rate', type: 'numeric', nullable: true })
  hourlyRate?: number;

  @Column({ name: 'ref_code_used', type: 'varchar', nullable: true })
  refCodeUsed?: string;

  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  businessName?: string;

  @Column({
    name: 'onboarding_status',
    type: 'enum',
    enum: OnboardingStatus,
    nullable: true,
  })
  onboardingStatus?: OnboardingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
