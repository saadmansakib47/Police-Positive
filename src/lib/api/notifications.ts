const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'case_assigned' | 'case_updated' | 'case_resolved' | 'system';
  title: string;
  message: string;
  relatedCaseId?: string;
  relatedOfficerId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class NotificationsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = localStorage.getItem('token');

    const headers: any = {
      ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) return null as any;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/complaints/notifications');
  }

  async markAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/complaints/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllAsRead(): Promise<void> {
    return this.request<void>('/complaints/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }
}

export const notificationsAPI = new NotificationsAPI();