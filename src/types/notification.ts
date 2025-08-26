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

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}