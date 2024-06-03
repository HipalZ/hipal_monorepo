importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey:'AIzaSyAw9LLt7YNZLjfxcst41S-DkQF_cOED-_8',
    authDomain: "hipal-demo.firebaseapp.com",
    projectId: "hipal-demo",
    storageBucket: "hipal-demo.appspot.com",
    messagingSenderId: "617554921241",
    appId: "1:617554921241:web:bdfb3cd06014c1d1d42788",
    measurementId: "G-02YMLLKJVT"
  };
  

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});