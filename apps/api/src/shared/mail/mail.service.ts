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
    const link = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your IncidentOps account',
      text: `Hi ${name}, verify your email: ${link}`,
      html: `
        <h2>Welcome to IncidentOps, ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${link}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
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

  async sendInvitationEmail(
    email: string,
    name: string,
    inviteToken: string,
    invitedByName: string,
    role: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/accept-invite?token=${inviteToken}`;
    const rolePretty = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    await this.sendMail({
      to: email,
      subject: `You've been invited to IncidentOps as ${rolePretty}`,
      text: `Hi ${name}, ${invitedByName} has invited you to IncidentOps as ${rolePretty}. Accept your invitation: ${link} (expires in 72 hours)`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family:Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px;">
            <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">⚡ IncidentOps</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#fff;margin-top:0;">You're invited, ${name}!</h2>
                <p style="color:#a3a3a3;line-height:1.6;">
                  <strong style="color:#e5e5e5;">${invitedByName}</strong> has invited you to join 
                  <strong style="color:#e5e5e5;">IncidentOps</strong> as a 
                  <strong style="color:#6366f1;">${rolePretty}</strong>.
                </p>
                <p style="color:#a3a3a3;line-height:1.6;">
                  Click the button below to set your password and activate your account.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${link}" 
                     style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                    Accept Invitation
                  </a>
                </div>
                <p style="color:#737373;font-size:13px;text-align:center;">
                  This invitation expires in <strong>72 hours</strong>.<br/>
                  If you were not expecting this email, you can safely ignore it.
                </p>
                <hr style="border:none;border-top:1px solid #262626;margin:24px 0;" />
                <p style="color:#525252;font-size:12px;text-align:center;">
                  Or copy this link:<br/>
                  <a href="${link}" style="color:#6366f1;word-break:break-all;">${link}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }
}
