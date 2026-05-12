import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('service')
export class Service {
  @PrimaryColumn({ type: 'varchar' })
  service_key: string;

  @Column({ name: 'category_key', type: 'varchar' })
  category_key: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'display_order', type: 'integer' })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
