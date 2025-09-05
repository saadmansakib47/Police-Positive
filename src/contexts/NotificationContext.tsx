import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { notificationsAPI, Notification } from "@/lib/api/notifications";
import { NotificationContextType } from "@/types/notification";
import { useAuth } from "@/hooks/useAuth";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const actualUser = (user as any)?.user || user;

  const fetchNotifications = async () => {
    if (!actualUser) return;

    try {
      setLoading(true);
      setError(null);

      const data = await notificationsAPI.getNotifications();

      // ✅ Ensure notifications is always an array
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (
        typeof data === "object" &&
        data !== null &&
        "notifications" in data &&
        Array.isArray((data as { notifications: Notification[] }).notifications)
      ) {
        setNotifications(
          (data as { notifications: Notification[] }).notifications
        );
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
      setNotifications([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark all as read"
      );
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  useEffect(() => {
    if (actualUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // poll every 30 sec
      return () => clearInterval(interval);
    }
  }, [actualUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
