import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { EmailTemplatesService } from './email-templates.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  
  @Controller('email-templates')
  @UseGuards(JwtAuthGuard, new RolesGuard('ADMIN'))
  export class EmailTemplatesController {
    constructor(private readonly emailTemplatesService: EmailTemplatesService) {}
  
    @Get()
    getTemplates(@Req() req: any) {
      return this.emailTemplatesService.getTemplates(req.user.userId);
    }
  
    @Get(':id')
    getTemplate(@Param('id') id: string, @Req() req: any) {
      return this.emailTemplatesService.getTemplate(id, req.user.userId);
    }
  
    @Patch(':id')
    updateTemplate(
      @Param('id') id: string,
      @Req() req: any,
      @Body()
      body: {
        name?: string;
        subject?: string;
        bodyHtml?: string;
        isActive?: boolean;
      },
    ) {
      return this.emailTemplatesService.updateTemplate(id, req.user.userId, body);
    }
  }