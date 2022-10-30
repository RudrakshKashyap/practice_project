import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.entity';
// import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from './task-status-enum';
import { User } from '../auth/user.entity';

import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

//
// @Injectable()
// export class TasksService {
//     constructor( private tasksRepository: TasksRepository) {}
//
//     createTask(createTaskDto: CreateTaskDto): Promise<Task> {
//         console.log(this.tasksRepository);
//      return this.tasksRepository.createTask(createTaskDto);
//    }
// }


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}


  private logger = new Logger('TasksService');

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search, created_by } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('task');
    query.leftJoinAndSelect('task.user', 'user');
    // query.where({ user }); //get all task for user

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (created_by) {
      query.andWhere('task.created_by = :created_by', { created_by });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search) OR LOWER(task.created_by) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,//include stack trace
      );
      throw new InternalServerErrorException();
    }
  }

  async deleteTask(id: string, user: User): Promise<void> {

    let result;

    if (user.role === "admin") result = await this.tasksRepository.delete({ id });
    else result = await this.tasksRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.tasksRepository.save(task);
    return task;
  }



  async getTaskById(id: string, user: User): Promise<Task> {
    // const found = await this.tasksRepository.find({ where: { id, user.username } });
    let found;

    if (user.role === 'admin')
      found = await this.tasksRepository
        .createQueryBuilder('task')
        .where('task.id = :id', { id })
        .getOne();
    else
      found = await this.tasksRepository.findOne({ where: { id, user } });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return found;

  }





  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    newuser: string,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    // if(Object.values(TaskStatus).includes(status))
    // {
    task.status = status;

    if (user.role === 'admin' && newuser) {
      const query = await this.usersRepository.findOne({
        where: {
          username: newuser,
        }
      });

      if (!query) {
        throw new NotFoundException(`user "${newuser}" not found`);
      }
      task.user = query;
    }

    await this.tasksRepository.save(task);
    return task;
    // }
    // else
    // {
    //     throw new InternalServerErrorException();
    // }
  }


}
