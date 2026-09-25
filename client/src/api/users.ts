import api from './axios';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

export async function getUsers(role?: string): Promise<UserSummary[]> {
  const response = await api.get('/auth/users', { params: { role } });
  return response.data;
}
