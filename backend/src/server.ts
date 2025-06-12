import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://ide.devmunna.xyz',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api', routes);

// Basic health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a project room
  socket.on('join-project', (projectId: string) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  // Handle real-time code changes
  socket.on('code-change', async (data: { projectId: string; fileId: string; content: string }) => {
    try {
      await prisma.file.update({
        where: { id: data.fileId },
        data: { content: data.content },
      });
      
      // Broadcast the change to all clients in the project room except the sender
      socket.to(data.projectId).emit('code-update', {
        fileId: data.fileId,
        content: data.content,
      });
    } catch (error) {
      console.error('Error updating file:', error);
    }
  });

  // Handle cursor position updates
  socket.on('cursor-move', (data: { projectId: string; userId: string; cursor: any }) => {
    socket.to(data.projectId).emit('cursor-update', {
      userId: data.userId,
      cursor: data.cursor,
    });
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 