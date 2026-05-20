import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityService {
	constructor(private prisma: PrismaService) {}

	async getLoginLogs(userId: number) {
		return this.prisma.loginLog.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: 20,
		});
	}

	async getAllLoginLogs(params: {
		page?: number;
		limit?: number;
		search?: string;
	}) {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const skip = (page - 1) * limit;
		const search = params.search?.trim();

		const where = search
			? {
					OR: [
						{ email: { contains: search, mode: 'insensitive' as const } },
						{
							user: {
								firstName: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
						},
						{
							user: {
								lastName: {
									contains: search,
									mode: 'insensitive' as const,
								},
							},
						},
					],
				}
			: {};

		const [data, total] = await this.prisma.$transaction([
			this.prisma.loginLog.findMany({
				where,
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			}),
			this.prisma.loginLog.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		};
	}
}