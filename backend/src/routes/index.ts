import { Router } from 'express';
import { userController } from '../controllers/userController';
import { projectController } from '../controllers/projectController';
import { fileController } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { userValidation, projectValidation, fileValidation } from '../middleware/validator';

const router = Router();

// User routes
router.post('/users/register', validate(userValidation.register), userController.register);
router.post('/users/login', validate(userValidation.login), userController.login);
router.post('/users/logout', userController.logout);
router.get('/users/verify-email', userController.verifyEmail);
router.post('/users/forgot-password', validate(userValidation.forgotPassword), userController.forgotPassword);
router.post('/users/reset-password/:token', validate(userValidation.resetPassword), userController.resetPassword);
router.get('/users/find-by-email', auth, userController.findByEmail);
router.get('/users/:id', auth, userController.getProfile);
router.get('/users/me', auth, userController.getMe);

// Project routes
router.post('/projects', auth, validate(projectValidation.create), projectController.createProject);
router.get('/projects', auth, projectController.getUserProjects);
router.get('/projects/:id', auth, projectController.getProject);
router.put('/projects/:id', auth, validate(projectValidation.update), projectController.updateProject);
router.delete('/projects/:id', auth, projectController.deleteProject);
router.post('/projects/:id/members', auth, projectController.addMember);
router.delete('/projects/:id/members', auth, projectController.removeMember);

// File routes
router.post('/files', auth, validate(fileValidation.create), fileController.createFile);
router.get('/files/:id', auth, fileController.getFile);
router.put('/files/:id', auth, validate(fileValidation.update), fileController.updateFile);
router.delete('/files/:id', auth, fileController.deleteFile);
router.get('/projects/:projectId/files', auth, fileController.getProjectFiles);

export default router;