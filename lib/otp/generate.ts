import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const OTP_LENGTH = 6;

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString().padStart(OTP_LENGTH, '0');
}

export function hashOTP(otp: string, userId: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${otp}:${userId}`)
    .digest('hex');
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
}

export { OTP_EXPIRY_MINUTES, MAX_ATTEMPTS };
