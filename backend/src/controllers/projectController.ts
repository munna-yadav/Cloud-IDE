import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const ownerId = req.user.userId;

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
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          members: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
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
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // Only return the project if the user is owner or member
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { id: userId } } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          members: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
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
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          members: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            }
          },
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
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('Deleting project:', projectId);

      // Check if the project exists and if the user is the owner
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.ownerId !== userId) {
        return res.status(403).json({ error: 'Only the project owner can delete the project' });
      }

      // Use a transaction to ensure atomic deletion
      await prisma.$transaction(async (tx) => {
        // First delete all files associated with the project
        await tx.file.deleteMany({
          where: { projectId: projectId },
        });

        // Then delete the project itself
        await tx.project.delete({
          where: { id: projectId },
        });
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async addMember(req: Request, res: Response) {
    try {
      const { id: projectId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            select: {
              id: true,
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (project.members.some(member => member.id === userId)) {
        return res.status(400).json({ error: 'User is already a member of this project' });
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
        include: {
          members: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
        },
      });

      return res.json(updatedProject);
    } catch (error) {
      console.error('Add member error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async removeMember(req: Request, res: Response) {
    try {
      const { id: projectId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if project exists and user is a member
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            select: {
              id: true,
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (!project.members.some(member => member.id === userId)) {
        return res.status(400).json({ error: 'User is not a member of this project' });
      }

      // Remove member from project
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
        include: {
          members: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
        },
      });

      return res.json(updatedProject);
    } catch (error) {
      console.error('Remove member error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { id: userId } } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          members: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      return res.json(projects);
    } catch (error) {
      console.error('Get user projects error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};