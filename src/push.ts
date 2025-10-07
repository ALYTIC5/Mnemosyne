// src/push.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

// --- Your Firebase config (keep yours) ---
const firebaseConfig = {
  apiKey: "AIzaSyCNWM9bGkvhkoFp6Dx1Jf8874T10alya7s",
  authDomain: "mnemosyne-e777e.firebaseapp.com",
  projectId: "mnemosyne-e777e",
  storageBucket: "mnemosyne-e777e.appspot.com",
  messagingSenderId: "889519913651",
  appId: "1:889519913651:web:3c4c8bc9defaf58e41cec6",
};

// --- Paste your VAPID public key from Firebase Console → Cloud Messaging ---
const VAPID_PUBLIC_KEY = "BDriI9jaFSeKHRdX7OmTaF5HMuSvHbQNOj4iEefKH9MOHm692xsqzLRlVsDwapGltvQjlxoZy7nUkmHDi-VY0Kk";

// Initialize once and reuse
let _messaging: Messaging | null = null;
async function ensureMessaging(): Promise<Messaging | null> {
  if (_messaging) return _messaging;
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn("[Push] Firebase messaging not supported in this browser.");
    return null;
  }
  const app = initializeApp(firebaseConfig);
  _messaging = getMessaging(app);
  return _messaging;
}

/**
 * Request permission and get the FCM token.
 * IMPORTANT: We explicitly register the Firebase messaging SW at /firebase-messaging-sw.js
 * and pass THAT registration to getToken().
 */
export async function getFcmToken(): Promise<string | null> {
  const messaging = await ensureMessaging();
  if (!messaging) return null;

  // Ask permission
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    alert("Notifications permission not granted.");
    return null;
  }

  // Register the Firebase messaging SW (NOT your PWA sw.js)
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: reg, // <-- use the Firebase messaging SW
    });
    if (!token) {
      alert("Failed to get FCM token. Check VAPID key and SW path.");
      return null;
    }
    console.log("[Push] FCM token:", token);
    localStorage.setItem("mnemo_fcm_token", token);
    return token;
  } catch (err) {
    console.error("[Push] getToken error", err);
    alert("Error getting FCM token. Open console for details.");
    return null;
  }
}

export async function subscribeForegroundMessages(
  cb: (title: string, body: string) => void
) {
  const messaging = await ensureMessaging();
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Mnemosyne";
    const body = payload.notification?.body || "";
    cb(title, body);
  });
}
