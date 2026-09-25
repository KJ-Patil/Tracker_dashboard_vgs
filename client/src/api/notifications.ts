import api from './axios';

export interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  taskId?: string;
  createdAt: string;
}

export async function getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markNotificationRead(id: string): Promise<{ notification: NotificationItem; unreadCount: number }> {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead(): Promise<{ message: string; unreadCount: number }> {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}
