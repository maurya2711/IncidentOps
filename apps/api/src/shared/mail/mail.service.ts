import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('smtp.host');
    const user = this.configService.get<string>('smtp.user');

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('smtp.port'),
        auth: {
          user,
          pass: this.configService.get<string>('smtp.pass'),
        },
      });
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    const from = this.configService.get<string>('smtp.from') ?? 'noreply@incidentops.io';

    if (!this.transporter) {
      this.logger.warn(`[DEV] Email to ${options.to}: ${options.subject}`);
      this.logger.warn(`[DEV] ${options.text ?? options.html}`);
      return;
    }

    await this.transporter.sendMail({ from, ...options });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/verify-email?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your IncidentOps account',
      text: `Hi ${name}, verify your email: ${link}`,
      html: `
        <h2>Welcome to IncidentOps, ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${link}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/reset-password?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Reset your IncidentOps password',
      text: `Hi ${name}, reset your password: ${link}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${name}, click the link below to reset your password:</p>
        <a href="${link}">Reset Password</a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    });
  }
}
