import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { TaskStatus, Priority } from '@prisma/client';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req.user!;
    const now = new Date();
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (role === 'ADMIN') {
      const totalProjects = await prisma.project.count();

      const [todoCount, inProgressCount, inReviewCount, doneCount] = await Promise.all([
        prisma.task.count({ where: { status: TaskStatus.TODO } }),
        prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
        prisma.task.count({ where: { status: TaskStatus.IN_REVIEW } }),
        prisma.task.count({ where: { status: TaskStatus.DONE } }),
      ]);

      const overdueCount = await prisma.task.count({
        where: {
          OR: [
            { isOverdue: true },
            { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
          ],
        },
      });

      const totalTasks = todoCount + inProgressCount + inReviewCount + doneCount;
      const totalUsers = await prisma.user.count();

      return res.json({
        role: 'ADMIN',
        totalProjects,
        totalUsers,
        totalTasks,
        tasksByStatus: {
          TODO: todoCount,
          IN_PROGRESS: inProgressCount,
          IN_REVIEW: inReviewCount,
          DONE: doneCount,
        },
        overdueCount,
      });
    }

    if (role === 'PROJECT_MANAGER') {
      const projects = await prisma.project.findMany({
        where: { managerId: userId },
        include: {
          _count: { select: { tasks: true } },
        },
      });

      const [lowCount, medCount, highCount, critCount] = await Promise.all([
        prisma.task.count({
          where: { project: { managerId: userId }, priority: Priority.LOW },
        }),
        prisma.task.count({
          where: { project: { managerId: userId }, priority: Priority.MEDIUM },
        }),
        prisma.task.count({
          where: { project: { managerId: userId }, priority: Priority.HIGH },
        }),
        prisma.task.count({
          where: { project: { managerId: userId }, priority: Priority.CRITICAL },
        }),
      ]);

      const upcomingThisWeek = await prisma.task.findMany({
        where: {
          project: { managerId: userId },
          status: { not: TaskStatus.DONE },
          dueDate: {
            gte: now,
            lte: oneWeekFromNow,
          },
        },
        include: {
          developer: { select: { name: true } },
          project: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
      });

      const overdueCount = await prisma.task.count({
        where: {
          project: { managerId: userId },
          OR: [
            { isOverdue: true },
            { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
          ],
        },
      });

      return res.json({
        role: 'PROJECT_MANAGER',
        totalProjects: projects.length,
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          client: p.client,
          taskCount: p._count.tasks,
        })),
        tasksByPriority: {
          LOW: lowCount,
          MEDIUM: medCount,
          HIGH: highCount,
          CRITICAL: critCount,
        },
        upcomingThisWeekCount: upcomingThisWeek.length,
        upcomingThisWeek,
        overdueCount,
      });
    }

    const totalAssigned = await prisma.task.count({
      where: { developerId: userId },
    });

    const [todoCount, inProgressCount, inReviewCount, doneCount] = await Promise.all([
      prisma.task.count({ where: { developerId: userId, status: TaskStatus.TODO } }),
      prisma.task.count({ where: { developerId: userId, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { developerId: userId, status: TaskStatus.IN_REVIEW } }),
      prisma.task.count({ where: { developerId: userId, status: TaskStatus.DONE } }),
    ]);

    const overdueCount = await prisma.task.count({
      where: {
        developerId: userId,
        OR: [
          { isOverdue: true },
          { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
        ],
      },
    });

    const upcomingThisWeek = await prisma.task.findMany({
      where: {
        developerId: userId,
        status: { not: TaskStatus.DONE },
        dueDate: {
          gte: now,
          lte: oneWeekFromNow,
        },
      },
      include: {
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return res.json({
      role: 'DEVELOPER',
      totalAssigned,
      tasksByStatus: {
        TODO: todoCount,
        IN_PROGRESS: inProgressCount,
        IN_REVIEW: inReviewCount,
        DONE: doneCount,
      },
      overdueCount,
      upcomingThisWeekCount: upcomingThisWeek.length,
      upcomingThisWeek,
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Something went wrong fetching dashboard statistics' });
  }
});

export default router;
