import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TaskStatus } from './task-status-enum';
import { User } from '../auth/user.entity';


import { Exclude } from 'class-transformer';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;


  //Eager relations only work when you use find* methods. If you use QueryBuilder eager relations are disabled and have to use leftJoinAndSelect to load the relation. Eager relations can only be used on one side of the relationship, using eager: true on both sides of relationship is disallowed.


  //https://youtu.be/1xLO-CeOC0U?t=373
  @ManyToOne(type => User, (user) => user.tasks, {
    eager: true,
  })
  @JoinColumn({
    name: 'created_by',
    // referencedColumnName: "username", //By default it will map to primary key
  })
  //  @Exclude({ toPlainOnly: true })    //whenever printing in plaintext exclude user property
  user: User;
}
