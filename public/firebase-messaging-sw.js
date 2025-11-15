importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAfKvZy0XgyZgdCXnFbQO-3pX_gpWdbGu4',
  authDomain: 'junction2025-21668.firebaseapp.com',
  projectId: 'junction2025-21668',
  storageBucket: 'junction2025-21668.firebasestorage.app',
  messagingSenderId: '468178422020',
  appId: '1:468178422020:web:3fdb5229533dac2c232851',
  measurementId: 'G-0ZDCR55ME4',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // ...
  self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/firebase-logo.png',
  });
});

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
