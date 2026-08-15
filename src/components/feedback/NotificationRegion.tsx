import { X } from "lucide-react";
import type { AppNotification } from "../../app/useNotifications";

interface NotificationRegionProps {
  notifications: AppNotification[];
  closeLabel: string;
  onDismiss: (id: string) => void;
}

export function NotificationRegion({
  notifications,
  closeLabel,
  onDismiss,
}: NotificationRegionProps) {
  return (
    <div className="app-notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`app-notification app-notification--${notification.kind}`}
          role={notification.kind === "error" ? "alert" : "status"}
          aria-atomic="true"
        >
          <span>{notification.message}</span>
          <button
            type="button"
            className="app-notification__close"
            onClick={() => onDismiss(notification.id)}
            aria-label={closeLabel}
          >
            <X aria-hidden="true" focusable="false" />
          </button>
        </div>
      ))}
    </div>
  );
}
