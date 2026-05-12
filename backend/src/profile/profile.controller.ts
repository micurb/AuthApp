import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Patch()
  updateProfile(
    @Req() req: any,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      jobTitle?: string;
      notificationsEnabled?: boolean;
    },
  ) {
    return this.profileService.updateProfile(req.user.userId, body);
  }

  @Patch('password')
  changePassword(
    @Req() req: any,
    @Body()
    body: {
      currentPassword?: string;
      newPassword: string;
    },
  ) {
    return this.profileService.changePassword(req.user.userId, body);
  }
}