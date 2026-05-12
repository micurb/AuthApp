import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Req,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  createUser(
    @Body()
    body: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      role?: 'USER' | 'ADMIN';
    },
  ) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      role?: 'USER' | 'ADMIN';
    },
  ) {
    return this.usersService.updateUser(id, req.user.userId, body);
  }

  @Post(':id/reset-password')
  resetUserPassword(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.resetUserPassword(id, req.user.userId);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.deleteUser(id, req.user.userId);
  }
}
