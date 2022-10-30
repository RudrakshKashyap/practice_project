//https://github.com/typeorm/typeorm/blob/master/docs/custom-repository.md
//https://github.com/typeorm/typeorm/blob/master/docs/active-record-data-mapper.md#what-is-the-data-mapper-pattern

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status-enum';
import { Task } from './task.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

// export const TasksRepository = datasource.getRepository(Task).extend({
//     async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
//         console.log("Inside");
//         const { title, description } = createTaskDto;
//         const task = this.create({
//           title,
//           description,
//           status: TaskStatus.OPEN,
//         });
//
//         await this.save(task);
//         return task;
//     }
// })

@Injectable()
export class TasksRepository extends Repository<Task> {
// constructor(
//   @InjectRepository(Task)
//   private tasksRepository: Repository<Task>,
// ) {}

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        console.log("Inside");
        const { title, description } = createTaskDto;
        const task = this.create({
          title,
          description,
          status: TaskStatus.OPEN,
    });

        await this.save(task);
        return task;
    }
}

