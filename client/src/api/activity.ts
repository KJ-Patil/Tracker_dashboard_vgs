import api from './axios';

export interface ActivityItem {
  id: string;
  action: string;
  taskId: string;
  userId: string;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    project?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export async function getActivityLogs(): Promise<ActivityItem[]> {
  const response = await api.get('/activity');
  return response.data;
}
