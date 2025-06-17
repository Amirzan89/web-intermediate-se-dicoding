import { VAPID_PUBLIC_KEY } from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
  sendReportToAllUserViaNotification
} from "../data/push-model.js";
import { checkAuth } from "../composables/Auth";

export function isNotificationAvailable(){
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();
  console.log("Notification permission status:", status);

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function registerServiceWorker() {
  if(!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in the browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered with scope:', registration.scope);
    
    // Log service worker state
    if (registration.installing) {
      console.log('Service Worker installing');
    } else if (registration.waiting) {
      console.log('Service Worker waiting');
    } else if (registration.active) {
      console.log('Service Worker active');
    }
    
    return registration;
  } catch (error) {
    console.error('Failed to register service worker:', error);
    return null;
  }
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.error('No service worker registration found');
    return null;
  }
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  console.log("Using VAPID key:", VAPID_PUBLIC_KEY);
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  const successSubscribeMessage = "Berhasil berlangganan notifikasi push.";
  const failureSubscribeMessage = "Gagal berlangganan notifikasi push.";

  // Check authentication first
  if (!checkAuth()) {
    console.error("User not authenticated. Please login first.");
    alert("Silakan login terlebih dahulu untuk berlangganan notifikasi.");
    return;
  }

  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert("Sudah berlangganan push notification.");
    return;
  }

  console.log("Mulai berlangganan push notification...");

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      console.error("No active service worker found");
      alert(failureSubscribeMessage);
      return;
    }

    console.log("Service worker is active, attempting to subscribe...");
    const pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    console.log("Subscription created:", pushSubscription);
    const subscriptionJson = pushSubscription.toJSON();
    console.log("Subscription JSON:", subscriptionJson);
    
    const { endpoint, keys } = subscriptionJson;
    console.log("Sending subscription to server...");
    const response = await subscribePushNotification({ endpoint, keys });
    console.log("Server response:", response);

    if (!response.ok) {
      console.error("subscribe: response:", response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return;
    }

    alert(successSubscribeMessage);
    
    // Test sending a notification immediately
    console.log("Testing notification...");
    await testPushNotification();
  } catch (error) {
    console.error("subscribe: error:", error);
    alert(failureSubscribeMessage);
  }
}

// Function to test push notification
export async function testPushNotification() {
  try {
    console.log("Sending test notification to all users...");
    const result = await sendReportToAllUserViaNotification();
    console.log("Test notification result:", result);
    return result;
  } catch (error) {
    console.error("Error sending test notification:", error);
    return { ok: false, error: error.message };
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";

  // Check authentication first
  if (!checkAuth()) {
    console.error("User not authenticated. Please login first.");
    alert("Silakan login terlebih dahulu untuk berhenti berlangganan notifikasi.");
    return;
  }

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert("Tidak dapat berhenti langganan karena belum terdaftar.");
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      return;
    }

    const { endpoint } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      console.warn(
        "Gagal memberitahu server, tapi sudah terhapus secara lokal."
      );
    }

    alert(successUnsubscribeMessage);
  } catch (error) {
    console.error("unsubscribe error:", error);
    alert(failureUnsubscribeMessage);
  }
}

function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Create a default export object for backward compatibility
const NotificationHelper = {
  requestPermission: requestNotificationPermission,
  registerServiceWorker,
  subscribePushNotification: async (registration) => {
    // Check authentication first
    if (!checkAuth()) {
      console.log("User not authenticated. Skipping push notification subscription.");
      return null;
    }

    if (!(await requestNotificationPermission())) {
      return null;
    }
    
    try {
      // Make sure service worker is active
      if (!registration.active) {
        console.error("Service worker is not active yet");
        return null;
      }

      const pushSubscription = await registration.pushManager.subscribe(
        generateSubscribeOptions()
      );
      
      const { endpoint, keys } = pushSubscription.toJSON();
      const response = await subscribePushNotification({ endpoint, keys });
      
      if (!response.ok) {
        console.error("subscribePushNotification: response:", response);
        await pushSubscription.unsubscribe();
        return null;
      }
      
      return pushSubscription;
    } catch (error) {
      console.error("subscribePushNotification error:", error);
      return null;
    }
  },
  unsubscribePushNotification: unsubscribe,
  checkSubscriptionStatus: async () => {
    return await isCurrentPushSubscriptionAvailable();
  },
  subscriptionState: false,
  testPushNotification,
};

export default NotificationHelper; 