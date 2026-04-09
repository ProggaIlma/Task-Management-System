import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { RolesGuard } from '@auth/roles.guard';
import { Roles } from '@auth/roles.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return this.auditService.findAll(pagination);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.auditService.findByUser(userId, pagination);
  }

  @Get('task/:taskId')
  async findByTask(
    @Param('taskId') taskId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.auditService.findByTask(taskId, pagination);
  }
}