import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
// BN6L7-X1wIaV6QWOufYuVyeVDuyoo0QvsKCzUu3jcCrETjGf7x8jKv6gw8-FduZwH1CbDilLI5IVdJ-04JmMdw8

const firebaseConfig = {
  apiKey: 'AIzaSyAw9LLt7YNZLjfxcst41S-DkQF_cOED-_8',
  authDomain: 'hipal-demo.firebaseapp.com',
  projectId: 'hipal-demo',
  storageBucket: 'hipal-demo.appspot.com',
  messagingSenderId: '617554921241',
  appId: '1:617554921241:web:bdfb3cd06014c1d1d42788',
  measurementId: 'G-02YMLLKJVT',
};

let messaging: any = null;

if (typeof window !== 'undefined') {
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export { messaging };
