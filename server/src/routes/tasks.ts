import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { TaskStatus, Priority } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req.user!;
    const { status, priority, dueDateFrom, dueDateTo, projectId, isOverdue, search } = req.query;

    const where: any = {};

    if (role === 'ADMIN') {
      if (projectId && typeof projectId === 'string') {
        where.projectId = projectId;
      }
    } else if (role === 'PROJECT_MANAGER') {
      where.project = { managerId: userId };
      if (projectId && typeof projectId === 'string') {
        where.projectId = projectId;
      }
    } else {
      where.developerId = userId;
      if (projectId && typeof projectId === 'string') {
        where.projectId = projectId;
      }
    }

    if (status && typeof status === 'string' && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status as TaskStatus;
    }

    if (priority && typeof priority === 'string' && Object.values(Priority).includes(priority as Priority)) {
      where.priority = priority as Priority;
    }

    if (isOverdue === 'true') {
      where.isOverdue = true;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom && typeof dueDateFrom === 'string') {
        where.dueDate.gte = new Date(dueDateFrom);
      }
      if (dueDateTo && typeof dueDateTo === 'string') {
        const toDate = new Date(dueDateTo);
        toDate.setHours(23, 59, 59, 999);
        where.dueDate.lte = toDate;
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any[] = [];
    if (role === 'DEVELOPER') {
      orderBy.push({ dueDate: 'asc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, client: true, managerId: true },
        },
        developer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy,
    });

    if (role === 'DEVELOPER') {
      const priorityWeights: Record<string, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      tasks.sort((a, b) => {
        const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Something went wrong fetching tasks' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { title, description, priority, dueDate, projectId, developerId } = req.body;

    if (!title || !priority || !dueDate || !projectId || !developerId) {
      return res.status(400).json({ error: 'Title, priority, dueDate, projectId, and developerId are required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { manager: true },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user!.role === 'PROJECT_MANAGER' && project.managerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not manage this project' });
    }

    const developer = await prisma.user.findUnique({ where: { id: developerId } });
    if (!developer || developer.role !== 'DEVELOPER') {
      return res.status(400).json({ error: 'Assigned user is not a valid developer' });
    }

    const taskDueDate = new Date(dueDate);
    const isOverdue = taskDueDate.getTime() < Date.now();

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority as Priority,
        dueDate: taskDueDate,
        isOverdue,
        projectId,
        developerId,
      },
      include: {
        project: { select: { id: true, name: true, client: true, managerId: true } },
        developer: { select: { id: true, name: true, email: true } },
      },
    });

    const notification = await prisma.notification.create({
      data: {
        message: `You were assigned a new task: "${task.title}" in ${project.name}`,
        userId: developerId,
        taskId: task.id,
      },
    });

    const creatorUser = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const creatorName = creatorUser ? creatorUser.name : 'A team member';

    const activity = await prisma.activityLog.create({
      data: {
        action: `${creatorName} created Task "${task.title}" in ${project.name}`,
        taskId: task.id,
        userId: req.user!.userId,
      },
      include: {
        task: { include: { project: true } },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    const io = req.app.get('io');
    if (io) {
      const eventData = {
        type: 'TASK_CREATED',
        task,
        activity,
      };

      io.to('admin').emit('task:created', eventData);
      io.to(project.managerId).emit('task:created', eventData);
      io.to(developerId).emit('task:created', eventData);
      io.to(`project:${task.projectId}`).emit('task:created', eventData);

      io.to('admin').emit('activity:new', activity);
      io.to(project.managerId).emit('activity:new', activity);
      io.to(developerId).emit('activity:new', activity);

      const unreadCount = await prisma.notification.count({
        where: { userId: developerId, isRead: false },
      });
      io.to(developerId).emit('notification:new', {
        notification,
        unreadCount,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Something went wrong creating task' });
  }
});

router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status || !Object.values(TaskStatus).includes(status as TaskStatus)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        developer: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user!.role === 'DEVELOPER' && task.developerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only update status for tasks assigned to you' });
    }

    if (req.user!.role === 'PROJECT_MANAGER' && task.project.managerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not manage the project for this task' });
    }

    const oldStatus = task.status;
    if (oldStatus === status) {
      return res.json(task);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: status as TaskStatus,
        isOverdue: status === TaskStatus.DONE ? false : task.dueDate.getTime() < Date.now(),
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        developer: { select: { id: true, name: true, email: true } },
      },
    });

    const actor = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, role: true },
    });
    const actorName = actor ? actor.name : 'User';

    const actionText = `${actorName} moved Task "${task.title}" from ${oldStatus} → ${status}`;

    const activity = await prisma.activityLog.create({
      data: {
        action: actionText,
        taskId: task.id,
        userId: req.user!.userId,
      },
      include: {
        task: { include: { project: true } },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    let pmNotification: any = null;
    if (status === TaskStatus.IN_REVIEW && task.project.managerId !== req.user!.userId) {
      pmNotification = await prisma.notification.create({
        data: {
          message: `Task "${task.title}" was moved to IN_REVIEW by ${actorName}`,
          userId: task.project.managerId,
          taskId: task.id,
        },
      });
    }

    const io = req.app.get('io');
    if (io) {
      const updatePayload = {
        type: 'TASK_STATUS_CHANGED',
        task: updatedTask,
        oldStatus,
        newStatus: status,
        activity,
      };

      io.to('admin').emit('task:updated', updatePayload);
      io.to(task.project.managerId).emit('task:updated', updatePayload);
      io.to(task.developerId).emit('task:updated', updatePayload);
      io.to(`project:${task.projectId}`).emit('task:updated', updatePayload);

      io.to('admin').emit('activity:new', activity);
      io.to(task.project.managerId).emit('activity:new', activity);
      io.to(task.developerId).emit('activity:new', activity);

      if (pmNotification) {
        const unreadCount = await prisma.notification.count({
          where: { userId: task.project.managerId, isRead: false },
        });
        io.to(task.project.managerId).emit('notification:new', {
          notification: pmNotification,
          unreadCount,
        });
      }
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Something went wrong updating task status' });
  }
});

export default router;
