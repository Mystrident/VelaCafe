import api from "../api/axios";

const urlBase64ToUint8Array = (value) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export const pushNotificationsSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const subscribeAdminToPushNotifications = async () => {
  if (!pushNotificationsSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const { data } = await api.get("/api/admin/push-public-key");
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }
  await api.post("/api/admin/push-subscriptions", subscription.toJSON());
};
