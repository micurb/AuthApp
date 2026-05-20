import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailTemplatesService {
	constructor(private readonly prisma: PrismaService) {}

	private async ensureSuperAdmin(currentUserId: number) {
		const currentUser = await this.prisma.user.findUnique({
			where: { id: currentUserId },
			select: {
				id: true,
				isSuperAdmin: true,
			},
		});

		if (!currentUser?.isSuperAdmin) {
			throw new ForbiddenException(
				'Tylko super administrator ma dostęp do szablonów email',
			);
		}
	}

	async getTemplates(currentUserId: number) {
		await this.ensureSuperAdmin(currentUserId);

		return this.prisma.emailTemplate.findMany({
			orderBy: {
				name: 'asc',
			},
		});
	}

	async getTemplate(id: string, currentUserId: number) {
		await this.ensureSuperAdmin(currentUserId);

		const template = await this.prisma.emailTemplate.findUnique({
			where: { id },
		});

		if (!template) {
			throw new NotFoundException('Szablon email nie istnieje');
		}

		return template;
	}

	async updateTemplate(
		id: string,
		currentUserId: number,
		data: {
			name?: string;
			subject?: string;
			bodyHtml?: string;
			isActive?: boolean;
		},
	) {
		await this.ensureSuperAdmin(currentUserId);

		const template = await this.prisma.emailTemplate.findUnique({
			where: { id },
		});

		if (!template) {
			throw new NotFoundException('Szablon email nie istnieje');
		}

		if (data.name !== undefined && !data.name.trim()) {
			throw new BadRequestException('Nazwa szablonu jest wymagana');
		}

		if (data.subject !== undefined && !data.subject.trim()) {
			throw new BadRequestException('Temat wiadomości jest wymagany');
		}

		if (data.bodyHtml !== undefined && !data.bodyHtml.trim()) {
			throw new BadRequestException('Treść wiadomości jest wymagana');
		}

		return this.prisma.emailTemplate.update({
			where: { id },
			data: {
				name: data.name,
				subject: data.subject,
				bodyHtml: data.bodyHtml,
				isActive: data.isActive,
			},
		});
	}
}