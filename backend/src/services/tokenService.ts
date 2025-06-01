import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
  userId: string;
}

export const tokenService = {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  },

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
  },

  setTokenCookie(res: Response, token: string): void {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  },

  clearTokenCookie(res: Response): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },
}; 