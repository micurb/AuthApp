import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service';
import { EmailTemplateKey } from './email-template-key.enum';

@Injectable()
export class MailerService {
  private transporter;

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

  async sendTemplateEmail(
    to: string,
    templateKey: EmailTemplateKey,
    variables: Record<string, string>,
  ) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: {
        key: templateKey,
      },
    });

    if (!template || !template.isActive) {
      throw new NotFoundException(
        `Email template ${templateKey} not found or inactive`,
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
  ) {
    await this.sendTemplateEmail(to, EmailTemplateKey.ACCOUNT_CREATED, {
      fullName: fullName ?? '',
      temporaryPassword: password,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.sendTemplateEmail(to, EmailTemplateKey.PASSWORD_RESET, {
      resetLink,
    });
  }

  async sendAccountDeletedEmail(to: string, fullName?: string) {
    await this.sendTemplateEmail(to, EmailTemplateKey.ACCOUNT_DELETED, {
      fullName: fullName ?? '',
    });
  }
}