import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { skip = 0, take = 5 } = pagination;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }
async updateUser(id: string, data: { name?: string }) {
  return this.prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
}