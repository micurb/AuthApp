import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	private ensureAdmin(req: any) {
		if (req.user?.role !== 'ADMIN' && !req.user?.isSuperAdmin) {
			throw new BadRequestException('Brak uprawnień');
		}
	}

	@Get()
	getUsers(@Req() req: any) {
		this.ensureAdmin(req);

		return this.usersService.getUsers();
	}

	@Post()
	createUser(
		@Req() req: any,
		@Body()
		body: {
			email: string;
			firstName?: string;
			lastName?: string;
			phone?: string;
			jobTitle?: string;
			role?: 'USER' | 'ADMIN';
			preferredLanguage?: string;
		},
	) {
		this.ensureAdmin(req);

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
			preferredLanguage?: string;
		},
	) {
		this.ensureAdmin(req);

		return this.usersService.updateUser(id, req.user.userId, body);
	}

	@Post(':id/reset-password')
	resetUserPassword(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: any,
	) {
		this.ensureAdmin(req);

		return this.usersService.resetUserPassword(id, req.user.userId);
	}

	@Delete(':id')
	deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		this.ensureAdmin(req);

		return this.usersService.deleteUser(id, req.user.userId);
	}
}