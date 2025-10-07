// src/notifications.ts

/**
 * Request permission from the user to show notifications.
 * This uses the native browser Notification API.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in globalThis)) {
    alert("Notifications are not supported in this browser.");
    return "denied";
  }

  let permission = Notification.permission;

  // Ask the user if they haven’t chosen yet
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission;
}

/**
 * Immediately show a local notification (works while the app is open or focused).
 * These are not scheduled; they fire instantly.
 */
export function showLocalNotification(title: string, body: string) {
  if (!("Notification" in globalThis)) return;

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
}
