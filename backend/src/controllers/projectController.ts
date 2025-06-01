import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const { name, description, ownerId } = req.body;

      const project = await prisma.project.create({
        data: {
          name,
          description,
          ownerId,
          members: {
            connect: { id: ownerId },
          },
        },
        include: {
          owner: true,
          members: true,
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProject(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true,
          members: true,
          files: true,
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateProject(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const { name, description } = req.body;

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          name,
          description,
        },
        include: {
          owner: true,
          members: true,
        },
      });

      return res.json(project);
    } catch (error) {
      console.error('Update project error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteProject(req: Request, res: Response) {
    try {
      const projectId = req.params.id;

      await prisma.project.delete({
        where: { id: projectId },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async addMember(req: Request, res: Response) {
    try {
      const { projectId, userId } = req.body;

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
        include: {
          members: true,
        },
      });

      return res.json(project);
    } catch (error) {
      console.error('Add member error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async removeMember(req: Request, res: Response) {
    try {
      const { projectId, userId } = req.body;

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
        include: {
          members: true,
        },
      });

      return res.json(project);
    } catch (error) {
      console.error('Remove member error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
}; 