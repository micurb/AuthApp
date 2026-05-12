import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './mailer/mailer.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';

@Module({
  imports: [AuthModule, ProfileModule, UsersModule, MailerModule, EmailTemplatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}