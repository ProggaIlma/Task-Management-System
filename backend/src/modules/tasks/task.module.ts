import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { AuditService } from '../audit/audit.service';
import { TasksController } from './task.controller';


@Module({
  providers: [TasksService, AuditService],
  controllers: [TasksController],
})
export class TasksModule {}