import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    throw new AppError('Validation failed', 400);
  };
};

// Validation schemas
export const userValidation = {
  register: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').optional().isString().withMessage('Name must be a string'),
  ],
  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  forgotPassword: [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  resetPassword: [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
};

export const projectValidation = {
  create: [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isString(),
    body('ownerId').isUUID().withMessage('Invalid owner ID'),
  ],
  update: [
    body('name').optional().isString(),
    body('description').optional().isString(),
  ],
};

export const fileValidation = {
  create: [
    body('name').notEmpty().withMessage('File name is required'),
    body('content').isString().withMessage('Content must be a string'),
    body('language').notEmpty().withMessage('Language is required'),
    body('path').notEmpty().withMessage('Path is required'),
    body('projectId').isUUID().withMessage('Invalid project ID'),
  ],
  update: [
    body('content').isString().withMessage('Content must be a string'),
  ],
}; 