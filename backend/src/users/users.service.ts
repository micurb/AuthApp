import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  private generateTemporaryPassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    let password = '';

    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  private getFullName(user: { firstName?: string | null; lastName?: string | null }) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }

  private validatePhone(phone?: string) {
    if (!phone) return;

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!phoneRegex.test(phone)) {
      throw new BadRequestException(
        'Numer telefonu może zawierać cyfry, spacje, +, -, () i mieć od 7 do 20 znaków',
      );
    }
  }

  async getUsers() {
    return this.prisma.user.findMany({
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
        preferredLanguage: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteUser(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('Nie możesz usunąć własnego konta');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    const userToDelete = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      throw new BadRequestException('Użytkownik nie istnieje');
    }

    if (userToDelete.isSuperAdmin) {
      throw new BadRequestException('Nie można usunąć super administratora');
    }

    if (userToDelete.role === 'ADMIN' && !currentUser?.isSuperAdmin) {
      throw new BadRequestException(
        'Tylko super administrator może usuwać administratorów',
      );
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    try {
      await this.mailerService.sendAccountDeletedEmail(
        deletedUser.email,
        this.getFullName(deletedUser),
        deletedUser.preferredLanguage,
      );
    } catch (error) {
      console.error('Nie udało się wysłać emaila o usunięciu konta:', error);
    }

    return deletedUser;
  }

  async updateUser(
    id: number,
    currentUserId: number,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      role?: 'USER' | 'ADMIN';
      preferredLanguage?: string;
    },
  ) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new BadRequestException('Użytkownik nie istnieje');
    }

    if (userToUpdate.isSuperAdmin) {
      throw new BadRequestException('Nie można edytować super administratora');
    }

    if (userToUpdate.role === 'ADMIN' && !currentUser?.isSuperAdmin) {
      throw new BadRequestException(
        'Tylko super administrator może edytować administratorów',
      );
    }

    this.validatePhone(data.phone);

    if (
      data.preferredLanguage &&
      !['pl', 'en'].includes(data.preferredLanguage)
    ) {
      throw new BadRequestException('Nieprawidłowy język użytkownika');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        jobTitle: data.jobTitle,
        role: data.role,
        preferredLanguage: data.preferredLanguage,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        jobTitle: true,
        role: true,
        isSuperAdmin: true,
        preferredLanguage: true,
        updatedAt: true,
      },
    });
  }

  async resetUserPassword(id: number, currentUserId: number) {
    const userToReset = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToReset) {
      throw new BadRequestException('Użytkownik nie istnieje');
    }

    if (userToReset.isSuperAdmin) {
      throw new BadRequestException(
        'Nie można resetować hasła super administratora',
      );
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    try {
      await this.mailerService.sendAccountCreatedEmail(
        userToReset.email,
        temporaryPassword,
        this.getFullName(userToReset),
        userToReset.preferredLanguage,
      );
    } catch (error) {
      console.error('Nie udało się wysłać emaila:', error);
    }

    return {
      message: 'Hasło tymczasowe zostało wygenerowane i wysłane na email',
    };
  }

  async createUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    role?: 'USER' | 'ADMIN';
    preferredLanguage?: string;
  }) {
    if (!data.email) {
      throw new BadRequestException('Email jest wymagany');
    }

    this.validatePhone(data.phone);

    if (
      data.preferredLanguage &&
      !['pl', 'en'].includes(data.preferredLanguage)
    ) {
      throw new BadRequestException('Nieprawidłowy język użytkownika');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Użytkownik z takim emailem już istnieje');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        jobTitle: data.jobTitle,
        role: data.role || 'USER',
        preferredLanguage: data.preferredLanguage || 'pl',
        mustChangePassword: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        jobTitle: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    try {
      await this.mailerService.sendAccountCreatedEmail(
        user.email,
        temporaryPassword,
        this.getFullName(user),
        user.preferredLanguage,
      );
    } catch (error) {
      console.error('Nie udało się wysłać emaila:', error);
    }

    return user;
  }
}