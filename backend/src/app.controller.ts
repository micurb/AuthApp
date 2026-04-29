import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  @Post('users')
  async createUser(
    @Body()
    body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
    },
  ) {
    return this.prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        jobTitle: body.jobTitle,
      },
    });
  }
}