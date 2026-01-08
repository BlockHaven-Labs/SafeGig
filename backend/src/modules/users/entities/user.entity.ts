import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { UserSkill } from './user-skill.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 42 })
  wallet_address: string;

  @Column({ type: 'text', nullable: true })
  metadata_uri: string;

  @Column({ type: 'smallint', nullable: true })
  user_type: number; // 0=None, 1=Freelancer, 2=Client, 3=Both

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ type: 'bigint', nullable: true })
  registration_time: number;

  @Column({ type: 'bigint', nullable: true })
  last_synced_block: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => UserSkill, (skill) => skill.user)
  skills: UserSkill[];
}