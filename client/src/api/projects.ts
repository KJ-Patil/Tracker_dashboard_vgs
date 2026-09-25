import api from './axios';

export interface Project {
  id: string;
  name: string;
  client: string;
  managerId: string;
  createdAt: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    tasks: number;
  };
}

export async function getProjects(): Promise<Project[]> {
  const response = await api.get('/projects');
  return response.data;
}

export async function createProject(data: {
  name: string;
  client: string;
  managerId?: string;
}): Promise<Project> {
  const response = await api.post('/projects', data);
  return response.data;
}

export async function getProject(id: string): Promise<Project> {
  const response = await api.get(`/projects/${id}`);
  return response.data;
}
