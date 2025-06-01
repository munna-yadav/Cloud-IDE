import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerificationToken: verificationToken,
        },
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);

      // Remove sensitive data from response
      const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user;
      return res.status(201).json(userWithoutSensitiveData);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      const user = await prisma.user.findUnique({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
        },
      });

      return res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({ error: 'Please verify your email first' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove sensitive data from response
      const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user;
      return res.json({ user: userWithoutSensitiveData, token });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      return res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          projects: true,
          ownedProjects: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user;
      return res.json(userWithoutSensitiveData);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
}; 