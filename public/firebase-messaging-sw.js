importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCNWM9bGkvhkoFp6Dx1Jf8874T10alya7s",
  authDomain: "mnemosyne-e777e.firebaseapp.com",
  projectId: "mnemosyne-e777e",
  storageBucket: "mnemosyne-e777e.appspot.com",
  messagingSenderId: "889519913651",
  appId: "1:889519913651:web:3c4c8bc9defaf58e41cec6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Mnemosyne";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
});
