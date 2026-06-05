import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHqSJSK4fBL6R99J1Ms-0H7kt1eZYJXzU",
  authDomain: "book-my-influencer-41a71.firebaseapp.com",
  projectId: "book-my-influencer-41a71",
  storageBucket: "book-my-influencer-41a71.firebasestorage.app",
  messagingSenderId: "636438517698",
  appId: "1:636438517698:web:474b617713249bc308685b",
  measurementId: "G-34J9B8EEDS"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let analytics: Analytics | undefined;

// Only initialize analytics on the client side
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
