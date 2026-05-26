import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Credixa Bank <noreply@shopoceanglow.com>';
const APP_NAME = 'Credixa Bank';

export async function sendWelcomeEmail(email: string, firstName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Welcome, ${firstName}! 🎉</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your account has been successfully created. You now have access to all our banking services.
          </p>
          <div style="background: #f9fafb; border-left: 4px solid #0066cc; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #374151; font-weight: 500;">What you can do now:</p>
            <ul style="color: #6b7280; margin: 8px 0 0 0; padding-left: 20px;">
              <li>View your account balance</li>
              <li>Transfer money securely</li>
              <li>Apply for loans</li>
              <li>Track transactions</li>
              <li>Complete KYC verification</li>
            </ul>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #0066cc; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Go to Dashboard
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            If you didn't create this account, please contact support immediately.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendTransactionEmail(
  email: string,
  firstName: string,
  amount: number,
  type: 'sent' | 'received',
  reference: string,
  description?: string
) {
  const isSent = type === 'sent';
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Transaction ${isSent ? 'Sent' : 'Received'} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">${isSent ? '💸' : '💰'}</div>
            <h2 style="color: #111827; margin: 8px 0;">Money ${isSent ? 'Sent' : 'Received'}</h2>
          </div>
          <p style="color: #6b7280;">Hi ${firstName},</p>
          <p style="color: #6b7280;">
            ${isSent ? 'You have successfully sent' : 'You have received'} a payment.
          </p>
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Amount:</span>
              <span style="color: ${isSent ? '#ef4444' : '#10b981'}; font-weight: 700; font-size: 20px;">
                ${isSent ? '-' : '+'}$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Reference:</span>
              <span style="color: #111827; font-family: monospace;">${reference}</span>
            </div>
            ${description ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Description:</span>
              <span style="color: #111827;">${description}</span>
            </div>` : ''}
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/transactions"
             style="display: inline-block; background: #0066cc; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Transaction
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendLoanApplicationEmail(
  email: string,
  firstName: string,
  amount: number,
  term: number,
  monthlyPayment: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Loan Application Received - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Loan Application Received 📋</h2>
          <p style="color: #6b7280;">Hi ${firstName},</p>
          <p style="color: #6b7280;">We've received your loan application. Our team will review it within 2-3 business days.</p>
          <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #374151; margin-top: 0;">Loan Details</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Principal Amount:</span>
                <span style="color: #111827; font-weight: 600;">$${amount.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Loan Term:</span>
                <span style="color: #111827; font-weight: 600;">${term} months</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Monthly Payment:</span>
                <span style="color: #0066cc; font-weight: 700;">$${monthlyPayment.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/loans"
             style="display: inline-block; background: #0066cc; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Check Application Status
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendKYCStatusEmail(
  email: string,
  firstName: string,
  status: 'submitted' | 'approved' | 'rejected',
  notes?: string
) {
  const statusConfig = {
    submitted: { emoji: '📋', title: 'KYC Submitted', color: '#f59e0b', message: 'Your KYC documents have been received and are under review. This typically takes 2-3 business days.' },
    approved: { emoji: '✅', title: 'KYC Approved', color: '#10b981', message: 'Congratulations! Your identity has been verified. You now have full access to all banking features.' },
    rejected: { emoji: '❌', title: 'KYC Rejected', color: '#ef4444', message: 'Unfortunately, we were unable to verify your identity. Please resubmit with clearer documents.' },
  };

  const config = statusConfig[status];

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `KYC ${config.title} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">${config.emoji}</div>
            <h2 style="color: ${config.color}; margin: 8px 0;">${config.title}</h2>
          </div>
          <p style="color: #6b7280;">Hi ${firstName},</p>
          <p style="color: #6b7280;">${config.message}</p>
          ${notes ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #374151;">${notes}</p></div>` : ''}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyc"
             style="display: inline-block; background: #0066cc; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View KYC Status
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendOTPEmail(
  email: string,
  firstName: string,
  otp: string,
  expiryMinutes: number = 10
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your ${APP_NAME} verification code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Your Verification Code 🔐</h2>
          <p style="color: #6b7280;">Hi ${firstName},</p>
          <p style="color: #6b7280;">
            Use the code below to complete your sign-in. Never share this code with anyone.
          </p>

          <!-- OTP Code Box -->
          <div style="background: #f0f7ff; border: 2px dashed #0066cc; border-radius: 12px; padding: 32px; text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
            <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #0066cc; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0 0;">
              ⏱ Expires in ${expiryMinutes} minutes
            </p>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              🔒 <strong>Security tip:</strong> ${APP_NAME} will never call or email you asking for this code.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            If you didn't attempt to sign in, someone may be trying to access your account.
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/forgot-password" style="color: #0066cc;">Secure your account</a>.
          </p>
        </div>
      </div>
    `,
  });
}

export async function send2FAStatusEmail(
  email: string,
  firstName: string,
  enabled: boolean
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'} — ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">${enabled ? '🛡️' : '⚠️'}</div>
            <h2 style="color: ${enabled ? '#10b981' : '#f59e0b'};">2FA ${enabled ? 'Enabled' : 'Disabled'}</h2>
          </div>
          <p style="color: #6b7280;">Hi ${firstName},</p>
          <p style="color: #6b7280;">
            Two-factor authentication has been <strong>${enabled ? 'enabled' : 'disabled'}</strong> on your account.
            ${enabled
              ? 'Your account is now more secure. You will be asked for a verification code on every sign-in.'
              : 'You will no longer need a verification code to sign in. We recommend keeping 2FA enabled for maximum security.'
            }
          </p>
          ${!enabled ? `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 13px;">
              If you did not make this change, please <a href="${process.env.NEXT_PUBLIC_APP_URL}/forgot-password" style="color: #0066cc;">secure your account immediately</a>.
            </p>
          </div>` : ''}
        </div>
      </div>
    `,
  });
}

export async function sendEmailConfirmationEmail(email: string, firstName: string, confirmLink: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Confirm your ${APP_NAME} account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="color: white; font-size: 24px; font-weight: 900;">C</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 40px;">✉️</div>
            <h2 style="color: #111827; margin: 8px 0 4px;">Confirm your email</h2>
            <p style="color: #6b7280; margin: 0;">Hi ${firstName}, one last step to activate your account.</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            Click the button below to verify your email address. This link expires in 24 hours.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmLink}"
               style="display: inline-block; background: #0066cc; color: white; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
              Confirm Email Address
            </a>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              🔒 If you didn't create a ${APP_NAME} account, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Or copy this link into your browser:<br/>
            <a href="${confirmLink}" style="color: #0066cc; word-break: break-all;">${confirmLink}</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Reset Your Password - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ ${APP_NAME}</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Reset Your Password 🔐</h2>
          <p style="color: #6b7280;">You requested a password reset. Click the button below to set a new password.</p>
          <p style="color: #9ca3af; font-size: 14px;">This link expires in 1 hour.</p>
          <a href="${resetLink}"
             style="display: inline-block; background: #0066cc; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
