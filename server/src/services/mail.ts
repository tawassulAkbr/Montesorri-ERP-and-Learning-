import { Resend } from 'resend';
import { config, emailEnabled } from '../config';

const resend = emailEnabled ? new Resend(config.RESEND_API_KEY) : null;

export interface CredentialEmailData {
  to: string;
  name: string;
  roleLabel: string;
  email: string;
  password: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendCredentialsEmail(data: CredentialEmailData): Promise<void> {
  const loginUrl = `${config.FRONTEND_URL}/login`;
  const subject = 'Your KinderGuide account credentials';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b;">
      <h2 style="color:#4f46e5;">Welcome to KinderGuide</h2>
      <p>Hello ${escapeHtml(data.name)},</p>
      <p>The school administrator has created a <strong>${escapeHtml(data.roleLabel)}</strong> account for you. Use the credentials below to sign in:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;width:120px;"><strong>Role</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(data.roleLabel)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Temporary password</strong></td><td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(data.password)}</td></tr>
      </table>
      <p style="margin:20px 0;"><a href="${loginUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Sign in to KinderGuide</a></p>
      <p style="color:#64748b;font-size:13px;">For your security, please change this password after your first login. If you did not expect this account, contact the school administrator.</p>
    </div>
  `;
  await deliver({ to: data.to, subject, html });
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${rawToken}`;
  const subject = 'Reset your KinderGuide password';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b;">
      <h2 style="color:#4f46e5;">Reset your password</h2>
      <p>We received a request to reset your KinderGuide password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <p style="margin:20px 0;"><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset password</a></p>
      <p style="color:#64748b;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  await deliver({ to, subject, html });
}

async function deliver(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    // Dev fallback: no RESEND_API_KEY configured — log instead of sending.
    console.log('\n[email disabled — no RESEND_API_KEY] would send:');
    console.log(`  To:      ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log('  (HTML body omitted)\n');
    return;
  }
  const { error } = await resend.emails.send({
    from: config.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
