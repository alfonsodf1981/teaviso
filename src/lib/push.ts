/**
 * Browser push — STUB / skeleton only.
 *
 * The `pushOn` flag on alerts is stored and shown in UI, but there is no
 * service worker, VAPID keys, or Web Push send path yet.
 * Next step: wire real browser push AFTER email delivery is solid.
 */

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  // Stub: do not actually prompt yet
  return Notification.permission;
}

export async function sendPushNotification(_opts: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ ok: false; reason: "stub" }> {
  return { ok: false, reason: "stub" };
}
