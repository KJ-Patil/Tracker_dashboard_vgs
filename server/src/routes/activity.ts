import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role, userId } = req.user!;

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
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.json(logs);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: 'Something went wrong fetching activity feed' });
  }
});

export default router;
