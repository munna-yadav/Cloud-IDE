import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { tokenService } from '../services/tokenService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = tokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
}; 