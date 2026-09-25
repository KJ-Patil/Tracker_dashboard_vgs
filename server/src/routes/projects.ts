import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, client, managerId } = req.body;

    if (!name || !client) {
      return res.status(400).json({ error: 'Name and client are required' });
    }

    let assignedManagerId = req.user!.userId;
    if (req.user!.role === 'ADMIN' && managerId) {
      const pmUser = await prisma.user.findUnique({ where: { id: managerId } });
      if (!pmUser) {
        return res.status(400).json({ error: 'Assigned manager not found' });
      }
      assignedManagerId = managerId;
    }

    const project = await prisma.project.create({
      data: {
        name,
        client,
        managerId: assignedManagerId,
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('project:created', project);
      io.to(assignedManagerId).emit('project:created', project);
    }

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong creating project' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req.user!;

    let projects;

    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          manager: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'PROJECT_MANAGER') {
      projects = await prisma.project.findMany({
        where: { managerId: userId },
        include: {
          manager: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: { tasks: { some: { developerId: userId } } },
        include: {
          manager: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong fetching projects' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { role, userId } = req.user!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            developer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (role === 'PROJECT_MANAGER' && project.managerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not manage this project' });
    }

    if (role === 'DEVELOPER') {
      const hasTask = project.tasks.some((t) => t.developerId === userId);
      if (!hasTask) {
        return res.status(403).json({ error: 'Forbidden: You do not have tasks in this project' });
      }
      project.tasks = project.tasks.filter((t) => t.developerId === userId);
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong fetching project details' });
  }
});

export default router;