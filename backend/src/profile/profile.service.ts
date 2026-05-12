import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  private validatePhone(phone?: string) {
    if (!phone) return;

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!phoneRegex.test(phone)) {
      throw new BadRequestException(
        'Numer telefonu może zawierać cyfry, spacje, +, -, () i mieć od 7 do 20 znaków',
      );
    }
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        jobTitle: true,
        role: true,
        isSuperAdmin: true,
        notificationsEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    userId: number,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      notificationsEnabled?: boolean;
    },
  ) {
    this.validatePhone(data.phone);

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        jobTitle: true,
        role: true,
        isSuperAdmin: true,
        notificationsEnabled: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(
    userId: number,
    data: {
      currentPassword?: string;
      newPassword: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.mustChangePassword) {
      const isValid = await bcrypt.compare(
        data.currentPassword || '',
        user.password,
      );

      if (!isValid) {
        throw new UnauthorizedException('Nieprawidłowe hasło');
      }
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(data.newPassword)) {
      throw new BadRequestException(
        'Hasło musi mieć min 8 znaków, dużą, małą literę, cyfrę i znak specjalny',
      );
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { message: 'Hasło zmienione' };
  }
}