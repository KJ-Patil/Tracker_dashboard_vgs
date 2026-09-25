import cron from 'node-cron';
import prisma from '../prisma';

export function startOverdueChecker() {
  cron.schedule('* * * * *', async () => {
    const result = await prisma.task.updateMany({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
        isOverdue: false,
      },
      data: {
        isOverdue: true,
      },
    });

    if (result.count > 0) {
      console.log(`[Overdue Checker] Marked ${result.count} task(s) as overdue`);
    }
  });

  console.log('[Overdue Checker] Job scheduled');
}