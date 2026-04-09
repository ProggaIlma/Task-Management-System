import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { ActionType } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { skip = 0, take = 5 } = pagination;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
          target: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      skip,
      take,
    };
  }

  async logAction(params: {
    actorId: string;
    action: ActionType;
    targetId?: string;
    beforeData?: any;
    afterData?: any;
    summary: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetId: params.targetId,
        beforeData: params.beforeData,
        afterData: params.afterData,
        summary: params.summary,
      },
    });
  }

  async findByUser(userId: string, pagination: PaginationDto) {
    const { skip = 0, take = 20 } = pagination;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { actorId: userId },
        include: {
          target: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where: { actorId: userId } }),
    ]);

    return {
      data: logs,
      total,
      skip,
      take,
    };
  }

  async findByTask(taskId: string, pagination: PaginationDto) {
    const { skip = 0, take = 20 } = pagination;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { targetId: taskId },
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where: { targetId: taskId } }),
    ]);

    return {
      data: logs,
      total,
      skip,
      take,
    };
  }
}