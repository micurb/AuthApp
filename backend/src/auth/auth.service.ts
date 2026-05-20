import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { PrismaService } from "../prisma/prisma.service";
import { MailerService } from "../mailer/mailer.service";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private mailerService: MailerService
	) {}

	private normalizeEmail(email: string) {
		return email.toLowerCase().trim();
	}

	private getLockUntilDate() {
		return new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
	}

	private isUserLocked(lockedUntil: Date | null) {
		return lockedUntil && lockedUntil > new Date();
	}

	async register(data: {
		email: string;
		password: string;
		firstName?: string;
		lastName?: string;
	}) {
		const email = this.normalizeEmail(data.email);

		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new BadRequestException("Email already exists");
		}

		if (!passwordRegex.test(data.password)) {
			throw new BadRequestException(
				"Hasło musi mieć min 8 znaków, dużą, małą literę, cyfrę i znak specjalny"
			);
		}

		const hashedPassword = await bcrypt.hash(data.password, 10);

		const user = await this.prisma.user.create({
			data: {
				email,
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
		const email = this.normalizeEmail(data.email);

		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new UnauthorizedException({
				code: "INVALID_CREDENTIALS",
				message: "Invalid credentials",
			});
		}

		if (this.isUserLocked(user.lockedUntil)) {
			throw new UnauthorizedException({
				code: "ACCOUNT_LOCKED",
				message: "Account temporarily locked",
				lockedUntil: user.lockedUntil,
			});
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password);

		if (!isPasswordValid) {
			const failedAttempts = user.failedLoginAttempts + 1;

			const lockedUntil =
				failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
					? this.getLockUntilDate()
					: null;

			await this.prisma.user.update({
				where: { id: user.id },
				data: {
					failedLoginAttempts: failedAttempts,
					lockedUntil,
				},
			});

			if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
				await this.mailerService.sendAccountLockedEmail(
					user.email,
					lockedUntil!.toLocaleString(),
					`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
					user.preferredLanguage
				);

				throw new UnauthorizedException({
					code: "ACCOUNT_LOCKED",
					message: "Account temporarily locked",
					lockedUntil,
				});
			}

			throw new UnauthorizedException({
				code: "INVALID_CREDENTIALS",
				message: "Invalid credentials",
				attemptsLeft: MAX_FAILED_LOGIN_ATTEMPTS - failedAttempts,
			});
		}

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				lastLoginAt: new Date(),
				failedLoginAttempts: 0,
				lockedUntil: null,
			},
		});

		await this.prisma.loginLog.create({
			data: {
				userId: user.id,
				email: user.email,
				ip: req?.ip || null,
				userAgent: req?.headers?.["user-agent"] || null,
			},
		});

		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
			isSuperAdmin: user.isSuperAdmin,
		};

		const token = await this.jwtService.signAsync(payload);

		return {
			access_token: token,
			mustChangePassword: user.mustChangePassword,
		};
	}

	async forgotPassword(emailInput: string) {
		const email = this.normalizeEmail(emailInput);

		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return {
				message: "Jeśli konto istnieje, email resetujący został wysłany.",
			};
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = await bcrypt.hash(resetToken, 10);
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetToken: hashedToken,
				passwordResetExpiresAt: expiresAt,
			},
		});

		await this.mailerService.sendPasswordResetEmail(
			user.email,
			resetToken,
			user.preferredLanguage
		);

		return {
			message: "Jeśli konto istnieje, email resetujący został wysłany.",
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
			throw new BadRequestException("Nieprawidłowy lub wygasły token");
		}

		if (!passwordRegex.test(data.password)) {
			throw new BadRequestException(
				"Hasło musi mieć min 8 znaków, dużą, małą literę, cyfrę i znak specjalny"
			);
		}

		const isSameAsCurrentPassword = await bcrypt.compare(
			data.password,
			matchedUser.password
		);

		if (isSameAsCurrentPassword) {
			throw new BadRequestException(
				"Nowe hasło nie może być takie samo jak obecne"
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
				failedLoginAttempts: 0,
				lockedUntil: null,
			},
		});

		return {
			message: "Hasło zostało zmienione",
		};
	}
}