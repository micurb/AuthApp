import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(data: { email: string; password: string }, req?: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    await this.prisma.loginLog.create({
      data: {
        userId: user.id,
        email: user.email,
        ip: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'Jeśli konto istnieje, email resetujący został wysłany.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: expiresAt,
      },
    });

    await this.mailerService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Jeśli konto istnieje, email resetujący został wysłany.',
    };
  }

  async resetPassword(data: { token: string; password: string }) {
    const users = await this.prisma.user.findMany({
      where: {
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    let matchedUser: (typeof users)[number] | null = null;

    for (const user of users) {
      if (!user.passwordResetToken) continue;

      const isMatch = await bcrypt.compare(data.token, user.passwordResetToken);

      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Nieprawidłowy lub wygasły token');
    }

    // walidacja hasła
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(data.password)) {
      throw new BadRequestException(
        'Hasło musi mieć min 8 znaków, dużą, małą literę, cyfrę i znak specjalny',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Hasło zostało zmienione',
    };
  }
}
