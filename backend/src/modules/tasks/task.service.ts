import {
  ForbiddenException, Injectable, NotFoundException
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { AuditService } from '@audit/audit.service';
import { CreateTaskDto, UpdateTaskDto, PaginationDto } from './dto/task.dto';
import { ActionType } from '@prisma/client';
import { Role } from '@common/enums/role.enum';
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof TASK_INCLUDE;
}>;
const TASK_INCLUDE = { assignedUser: true, creator: true } as const;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createTask(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: { ...dto, createdBy: userId },
      include: TASK_INCLUDE,
    });
    await this.auditService.logAction({
      actorId: userId,
      action: ActionType.CREATE_TASK,
      targetId: task.id,
      afterData: task,
      summary: `Task "${task.title}" created`,
    });
    return task;
  }

async findAllTasks(userId: string, role: string, pagination: PaginationDto) {
  const { skip = 0, take = 20 } = pagination;
  const where = role === 'ADMIN' ? {} : { assignedTo: userId };

  const [tasks, total] = await Promise.all([
    this.prisma.task.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    this.prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    total,
    skip,
    take,
  };
}

  async findOneTask(taskId: string, userId: string, role: Role): Promise<Task> {
    return this.findAndAuthorize(taskId, userId, role);
  }

async updateTask(
  taskId: string,
  userId: string,
  role: Role,
  dto: UpdateTaskDto,
): Promise<Task> {
  const before = await this.findAndAuthorize(taskId, userId, role);

  const task = await this.prisma.task.update({
    where: { id: taskId },
    data: dto,
    include: TASK_INCLUDE,
  });

  const changes: Array<{
    action: ActionType;
    beforeData: any;
    afterData: any;
    summary: string;
  }> = [];

  // Status change
  if (dto.status !== undefined && before.status !== dto.status) {
    changes.push({
      action: ActionType.STATUS_CHANGE,
      beforeData: { status: before.status },
      afterData: { status: task.status }, // use task.status (post-update) not dto
      summary: `Status changed from ${before.status} to ${task.status}`,
    });
  }

  const beforeAssignee = before.assignedTo ?? null;
  const afterAssignee = dto.assignedTo ?? null;

  if (dto.assignedTo !== undefined && beforeAssignee !== afterAssignee) {
    const oldUser = before?.assignedUser?.name || 'Unassigned';
    const newUser = task.assignedUser?.name || 'Unassigned';

    changes.push({
      action: ActionType.ASSIGNMENT_CHANGE,
      beforeData: { assignedTo: before.assignedTo, assignedUser: before.assignedUser },
      afterData: { assignedTo: task.assignedTo, assignedUser: task.assignedUser },
      summary: `Assignment changed from ${oldUser} to ${newUser}`,
    });
  }

  if (dto.title !== undefined && before.title !== dto.title) {
    changes.push({
      action: ActionType.UPDATE_TASK,
      beforeData: { title: before.title },
      afterData: { title: task.title },
      summary: `Title changed from "${before.title}" to "${task.title}"`,
    });
  }

  if (dto.description !== undefined && before.description !== dto.description) {
    changes.push({
      action: ActionType.UPDATE_TASK,
      beforeData: { description: before.description },
      afterData: { description: task.description },
      summary: `Description updated`,
    });
  }

  if (changes.length === 0) {
    changes.push({
      action: ActionType.UPDATE_TASK,
      beforeData: before,
      afterData: task,
      summary: `Task updated`,
    });
  }

  for (const change of changes) {
    await this.auditService.logAction({
      actorId: userId,
      action: change.action,
      targetId: task.id,
      beforeData: change.beforeData,
      afterData: change.afterData,
      summary: `Task "${task.title}": ${change.summary}`,
    });
  }

  return task;
}
  // async updateTask(
  //   taskId: string,
  //   userId: string,
  //   role: Role,
  //   dto: UpdateTaskDto,
  // ): Promise<Task> {
  //   const before = await this.findAndAuthorize(taskId, userId, role);
  //   const task = await this.prisma.task.update({
  //     where: { id: taskId },
  //     data: dto,
  //     include: TASK_INCLUDE,
  //   });
  //   await this.auditService.logAction({
  //     actorId: userId,
  //     action: ActionType.UPDATE_TASK,
  //     targetId: task.id,
  //     beforeData: before,
  //     afterData: task,
  //     summary: `Task "${task.title}" updated`,
  //   });
  //   return task;
  // }

  async deleteTask(taskId: string, userId: string, role: Role) {
  const task = await this.findOneTask(taskId, userId, role);
  
  await this.auditService.logAction({
    actorId: userId,
    action: ActionType.DELETE_TASK,
    targetId: taskId,
    beforeData: task,
    summary: `Task "${task.title}" deleted`,
  });
  
  await this.prisma.task.delete({
    where: { id: taskId },
  });
  
  return { message: 'Task deleted successfully' };
}
async getTaskStats(userId: string, role: string) {
  const where = role === 'ADMIN' ? {} : { assignedTo: userId };
  
  const [total, pending, processing, done] = await Promise.all([
    this.prisma.task.count({ where }),
    this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
    this.prisma.task.count({ where: { ...where, status: 'PROCESSING' } }),
    this.prisma.task.count({ where: { ...where, status: 'DONE' } }),
  ]);

  return { total, pending, processing, done };
}
  

  private async findAndAuthorize(
    taskId: string,
    userId: string,
    role: Role,
  ): Promise<TaskWithRelations> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    if (role !== Role.ADMIN && task.assignedTo !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }
}