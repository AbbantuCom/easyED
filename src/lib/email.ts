import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM ?? 'noreply@easyed.local';
  const client = getResendClient();

  if (!client) {
    // No email provider configured (e.g. local development) — log instead of sending.
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  await client.emails.send({ from, to, subject, html });
}

export async function sendInviteEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const link = `${appUrl}/accept-invite?token=${token}`;
  await sendEmail({
    to,
    subject: "You've been invited to easyEd",
    html: `<p>You've been invited to join your school's easyEd account.</p><p><a href="${link}">Accept your invite</a></p>`,
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Your easyEd verification code',
    html: `<p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p><p>This code expires in ${process.env.OTP_EXPIRY_MINUTES ?? '15'} minutes.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const link = `${appUrl}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your easyEd password',
    html: `<p>We received a request to reset your password.</p><p><a href="${link}">Reset your password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}
