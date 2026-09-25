import api from './axios';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  isOverdue: boolean;
  projectId: string;
  developerId: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    client: string;
    managerId: string;
  };
  developer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskFilterParams {
  status?: string;
  priority?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  projectId?: string;
  isOverdue?: string;
  search?: string;
}

export async function getTasks(filters?: TaskFilterParams): Promise<Task[]> {
  const response = await api.get('/tasks', { params: filters });
  return response.data;
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority: string;
  dueDate: string;
  projectId: string;
  developerId: string;
}): Promise<Task> {
  const response = await api.post('/tasks', data);
  return response.data;
}

export async function updateTaskStatus(taskId: string, status: string): Promise<Task> {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
}
