import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { tokenService } from '../services/tokenService';
import { PrismaClient } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

const prisma = new PrismaClient();

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = tokenService.verifyToken(token);
    // Fetch the user from the database and attach to req.user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        projects: true,
        ownedProjects: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', 401);
    }
    // Remove sensitive fields and add userId for type compatibility
    const { password, emailVerificationToken, ...userWithoutSensitiveData } = user;
    req.user = { ...userWithoutSensitiveData, userId: user.id };
    
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};