import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ambassador')
export class AmbassadorEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'amb_id' })
  ambId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'ref_code', unique: true })
  refCode: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'payout_details', type: 'text', nullable: true })
  payoutDetails?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
