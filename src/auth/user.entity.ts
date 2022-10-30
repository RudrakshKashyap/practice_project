import { Task } from '../tasks/task.entity';
import { Index, Column, Entity, OneToMany, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

import { Exclude } from 'class-transformer';


@Entity()
export class User {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @Index({ unique: true })
  @PrimaryColumn()
  username: string;

  @Column({ default: "not_admin"})
  role: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @OneToMany(type => Task, (task) => task.user, { cascade: true })
  tasks: Task[];
}