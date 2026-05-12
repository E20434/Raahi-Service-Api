import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('location')
export class Location {
  @PrimaryColumn({ type: 'varchar' })
  location_code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ name: 'parent_location_code', type: 'varchar', nullable: true })
  parent_location_code: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
