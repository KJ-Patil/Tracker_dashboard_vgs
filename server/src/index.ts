import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import notificationRoutes from './routes/notifications';
import activityRoutes from './routes/activity';
import dashboardRoutes from './routes/dashboard';
import { startOverdueChecker } from './jobs/overdueChecker';
import prisma from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('VGS Dashboard API Server is running');
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});
app.set('io', io);

const activeSocketsByUser = new Map<string, Set<string>>();

export const getOnlineUsersCount = () => activeSocketsByUser.size;

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    socket.disconnect();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    const userId = decoded.userId;
    const role = decoded.role;

    socket.data.userId = userId;
    socket.data.role = role;

    socket.join(userId);
    socket.join(`role:${role}`);
    if (role === 'ADMIN') {
      socket.join('admin');
    }

    if (!activeSocketsByUser.has(userId)) {
      activeSocketsByUser.set(userId, new Set());
    }
    activeSocketsByUser.get(userId)!.add(socket.id);

    io.emit('presence:count', { onlineCount: activeSocketsByUser.size });

    let whereClause: any = {};
    if (role === 'ADMIN') {
      whereClause = {};
    } else if (role === 'PROJECT_MANAGER') {
      whereClause = {
        task: {
          project: {
            managerId: userId,
          },
        },
      };
    } else {
      whereClause = {
        task: {
          developerId: userId,
        },
      };
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        task: {
          include: {
            project: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    socket.emit('catchup', logs.reverse());

    socket.on('project:join', (projectId: string) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
      }
    });

    socket.on('project:leave', (projectId: string) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      const userSockets = activeSocketsByUser.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeSocketsByUser.delete(userId);
        }
      }
      io.emit('presence:count', { onlineCount: activeSocketsByUser.size });
    });
  } catch (err) {
    socket.disconnect();
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startOverdueChecker();
});
