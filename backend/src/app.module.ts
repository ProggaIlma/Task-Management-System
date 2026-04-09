import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { AuditModule } from '@audit/audit.module';
import { TasksModule } from '@tasks/task.module';

@Module({
  imports: [PrismaModule, AuthModule, TasksModule, UsersModule, AuditModule],
})
export class AppModule {}