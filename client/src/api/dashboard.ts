import api from './axios';

export interface AdminStats {
  role: 'ADMIN';
  totalProjects: number;
  totalUsers: number;
  totalTasks: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  overdueCount: number;
}

export interface PMStats {
  role: 'PROJECT_MANAGER';
  totalProjects: number;
  projects: Array<{
    id: string;
    name: string;
    client: string;
    taskCount: number;
  }>;
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  upcomingThisWeekCount: number;
  upcomingThisWeek: Array<any>;
  overdueCount: number;
}

export interface DeveloperStats {
  role: 'DEVELOPER';
  totalAssigned: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  overdueCount: number;
  upcomingThisWeekCount: number;
  upcomingThisWeek: Array<any>;
}

export type DashboardStats = AdminStats | PMStats | DeveloperStats;

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/dashboard/stats');
  return response.data;
}
