import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service';
import { EmailTemplateKey } from './email-template-key.enum';

@Injectable()
export class MailerService {
	private transporter: Transporter;

	constructor(private readonly prisma: PrismaService) {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
	}

	private renderTemplate(template: string, variables: Record<string, string>) {
		return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
			return variables[key] ?? '';
		});
	}

	private getFrontendUrl() {
		return process.env.FRONTEND_URL || 'http://localhost:5173';
	}

	async sendTemplateEmail(
		to: string,
		templateKey: EmailTemplateKey,
		variables: Record<string, string>,
		language = 'pl',
	) {
		let template = await this.prisma.emailTemplate.findFirst({
			where: {
				key: templateKey,
				language,
			},
		});

		if (!template && language !== 'pl') {
			template = await this.prisma.emailTemplate.findFirst({
				where: {
					key: templateKey,
					language: 'pl',
				},
			});
		}

		if (!template || !template.isActive) {
			throw new NotFoundException(
				`Email template ${templateKey} (${language}) not found or inactive`,
			);
		}

		const subject = this.renderTemplate(template.subject, variables);
		const html = this.renderTemplate(template.bodyHtml, variables);

		await this.transporter.sendMail({
			from: process.env.SMTP_FROM,
			to,
			subject,
			html,
		});
	}

	async sendAccountCreatedEmail(
		to: string,
		password: string,
		fullName?: string,
		language = 'pl',
	) {
		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.ACCOUNT_CREATED,
			{
				fullName: fullName ?? '',
				temporaryPassword: password,
			},
			language,
		);
	}

	async sendPasswordResetEmail(to: string, token: string, language = 'pl') {
		const resetLink = `${this.getFrontendUrl()}/reset-password?token=${token}`;

		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.PASSWORD_RESET,
			{
				resetLink,
			},
			language,
		);
	}

	async sendAccountDeletedEmail(
		to: string,
		fullName?: string,
		language = 'pl',
	) {
		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.ACCOUNT_DELETED,
			{
				fullName: fullName ?? '',
			},
			language,
		);
	}

	async sendAccountLockedEmail(
		to: string,
		lockedUntil: string,
		fullName?: string,
		language = 'pl',
	) {
		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.ACCOUNT_LOCKED,
			{
				fullName: fullName ?? '',
				lockedUntil,
			},
			language,
		);
	}

	async sendAdminPasswordResetEmail(
		to: string,
		password: string,
		fullName?: string,
		language = 'pl',
	) {
		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.ADMIN_PASSWORD_RESET,
			{
				fullName: fullName ?? '',
				temporaryPassword: password,
			},
			language,
		);
	}

	async sendLoginNotificationEmail(
		to: string,
		data: {
			fullName?: string;
			ip?: string | null;
			userAgent?: string | null;
			loginDate: string;
		},
		language = 'pl',
	) {
		await this.sendTemplateEmail(
			to,
			EmailTemplateKey.LOGIN_NOTIFICATION,
			{
				fullName: data.fullName ?? '',
				ip: data.ip ?? 'Unknown',
				userAgent: data.userAgent ?? 'Unknown',
				loginDate: data.loginDate,
			},
			language,
		);
	}
}