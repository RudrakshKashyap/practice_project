import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task-status-enum';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}