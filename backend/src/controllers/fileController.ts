import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const fileController = {
  async createFile(req: Request, res: Response) {
    try {
      const { name, content, language, path, projectId } = req.body;

      const file = await prisma.file.create({
        data: {
          name,
          content,
          language,
          path,
          projectId,
        },
      });

      res.status(201).json(file);
    } catch (error) {
      console.error('Create file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: {
          project: true,
        },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

       return res.status(200).json(file);
    } catch (error) {
      console.error('Get file error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const { content } = req.body;

      const file = await prisma.file.update({
        where: { id: fileId },
        data: {
          content,
        },
      });

      return res.status(200).json(file);
    } catch (error) {
      console.error('Update file error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id;

      await prisma.file.delete({
        where: { id: fileId },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProjectFiles(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      const files = await prisma.file.findMany({
        where: { projectId },
        orderBy: { path: 'asc' },
      });

      return res.status(200).json(files);
    } catch (error) {
      console.error('Get project files error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
}; 