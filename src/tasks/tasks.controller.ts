import { Controller, Get, Post, Body, Param, Patch, UseGuards, Delete, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Logger } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { PassportModule } from '@nestjs/passport';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
    private logger = new Logger('TasksController');

  constructor(private tasksService: TasksService) {}

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
      this.logger.verbose(`${JSON.stringify(createTaskDto)}`);
    return this.tasksService.createTask(createTaskDto, user);
  }



  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    const { status, newuser } = updateTaskStatusDto;
    return this.tasksService.updateTaskStatus(id, status, newuser, user);
  }



  @Get()
    getTasks(
      @Query() filterDto: GetTasksFilterDto,
      @GetUser() user: User,
    ): Promise<Task[]> {
      this.logger.verbose(
        `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
          filterDto,
        )}`,
      );
      return this.tasksService.getTasks(filterDto, user);
    }


  @Get('/:id')
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }
}
