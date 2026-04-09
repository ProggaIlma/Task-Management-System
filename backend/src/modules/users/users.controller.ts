import { Controller, Get, Put, Param, Body, UseGuards,Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { RolesGuard } from '@auth/roles.guard';
import { Roles } from '@auth/roles.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
 @Roles('ADMIN')
  async findAll(@Query() pagination: PaginationDto) { 
    return this.usersService.findAll(pagination);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto, 
  ) {
    return this.usersService.updateUser(id, updateData);
  }
}