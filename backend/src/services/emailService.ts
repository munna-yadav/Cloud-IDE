import { Resend } from 'resend';
import { AppError } from '../middleware/errorHandler';

const resend = new Resend(process.env.RESEND_API_KEY);

const CLIENT_URL = 'https://ide.devmunna.xyz';

export const emailService = {
  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;
    
    try {
      await resend.emails.send({
        from: 'ide@devmunna.xyz',
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6; text-align: center;">Email Verification</h1>
            <p>Thank you for registering with Cloud IDE. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
            <p style="color: #666;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              If you didn't create an account with Cloud IDE, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Resend email error:', error);
      throw new AppError('Failed to send verification email', 500);
    }
  },

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
    
    try {
      await resend.emails.send({
        from: 'ide@devmunna.xyz',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6; text-align: center;">Password Reset</h1>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Resend email error:', error);
      throw new AppError('Failed to send password reset email', 500);
    }
  },
}; 