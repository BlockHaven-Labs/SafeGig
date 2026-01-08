import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_skills')
export class UserSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 100 })
  skill: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.skills)
  @JoinColumn({ name: 'user_id' })
  user: User;
}