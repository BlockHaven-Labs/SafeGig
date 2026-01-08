import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sync_state')
export class SyncState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 42 })
  contract_address: string;

  @Column({ type: 'bigint' })
  last_synced_block: number;

  @UpdateDateColumn()
  updated_at: Date;
}