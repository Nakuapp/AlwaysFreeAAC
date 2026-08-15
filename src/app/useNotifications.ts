import { useCallback, useEffect, useRef, useState } from "react";
import { createId } from "../utils/createId";

export interface AppNotification {
  id: string;
  message: string;
  kind: "status" | "error";
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      for (const timer of timersRef.current) clearTimeout(timer);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: AppNotification["kind"] = "status") => {
      const id = createId("notice");
      setNotifications((current) => [
        ...current.filter((notification) => notification.message !== message),
        { id, message, kind },
      ]);
      const timer = setTimeout(
        () => {
          timersRef.current.delete(timer);
          dismiss(id);
        },
        kind === "error" ? 8000 : 5000,
      );
      timersRef.current.add(timer);
    },
    [dismiss],
  );

  return { notifications, notify, dismiss };
}
