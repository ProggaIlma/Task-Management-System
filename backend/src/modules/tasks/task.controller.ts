import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from '@modules/tasks/task.service';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { RolesGuard } from '@auth/roles.guard';
import { Roles } from '@auth/roles.decorator';
import { CreateTaskDto, UpdateTaskDto } from '@modules/tasks/dto/task.dto';
import { PaginationDto } from '@tasks/dto/task.dto';
import { Role } from '@common/enums/role.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN)
  createTask(@Request() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(req.user.id, dto);
  }
  @Get('stats')
async getStats(@Request() req) {
  return this.tasksService.getTaskStats(req.user.id, req.user.role);
}
  @Get()
  getTasks(@Request() req, @Query() pagination: PaginationDto) {
    return this.tasksService.findAllTasks(req.user.id, req.user.role, pagination);
  }

  @Get(':id')
  getTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOneTask(id, req.user.id, req.user.role);
  }

  @Put(':id')
  updateTask(@Param('id') id: string, @Request() req, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, req.user.id, req.user.role, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.deleteTask(id, req.user.id, req.user.role);
  }


}
