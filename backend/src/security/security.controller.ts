import {
	Controller,
	ForbiddenException,
	Get,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecurityService } from './security.service';

@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
	constructor(private readonly securityService: SecurityService) {}

	@Get('login-logs')
	getLoginLogs(@Req() req: any) {
		return this.securityService.getLoginLogs(req.user.userId);
	}

	@Get('admin/login-logs')
	async getAllLoginLogs(
		@Req() req: any,
		@Query('page') page?: string,
		@Query('limit') limit?: string,
		@Query('search') search?: string,
	) {
		if (req.user.role !== 'ADMIN' && !req.user.isSuperAdmin) {
			throw new ForbiddenException('Access denied');
		}

		return this.securityService.getAllLoginLogs({
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 20,
			search,
		});
	}
}