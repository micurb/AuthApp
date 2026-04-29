import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  @Post('users')
  async createUser(@Body() body: { email: string; name?: string }) {
    return this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    });
  }
}