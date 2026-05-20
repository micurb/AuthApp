import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailTemplatesService } from './email-templates.service';

@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
	constructor(
		private readonly emailTemplatesService: EmailTemplatesService,
	) {}

	@Get()
	getTemplates(@Req() req: any) {
		return this.emailTemplatesService.getTemplates(req.user.userId);
	}

	@Get(':id')
	getTemplate(@Param('id') id: string, @Req() req: any) {
		return this.emailTemplatesService.getTemplate(id, req.user.userId);
	}

	@Patch(':id')
	updateTemplate(
		@Param('id') id: string,
		@Req() req: any,
		@Body()
		body: {
			name?: string;
			subject?: string;
			bodyHtml?: string;
			isActive?: boolean;
		},
	) {
		return this.emailTemplatesService.updateTemplate(
			id,
			req.user.userId,
			body,
		);
	}
}