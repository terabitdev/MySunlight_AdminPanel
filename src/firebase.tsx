import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Analytics } from "firebase/analytics";

// Firebase configuration loaded from Vite env variables
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase app (singleton)
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(firebaseApp);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(firebaseApp);

// Initialize Firebase Analytics and get a reference to the service
let analytics: Analytics | null = null;

// Check if analytics is supported before initializing
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
  }
});

export { analytics };