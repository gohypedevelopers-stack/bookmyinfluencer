import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHqSJSK4fBL6R99J1Ms-0H7kt1eZYJXzU",
  authDomain: "book-my-influencer-41a71.firebaseapp.com",
  projectId: "book-my-influencer-41a71",
  storageBucket: "book-my-influencer-41a71.firebasestorage.app",
  messagingSenderId: "636438517698",
  appId: "1:636438517698:web:474b617713249bc308685b",
  measurementId: "G-34J9B8EEDS"
};

// Initialize Firebase (safely checks if app already exists)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider to prompt for account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface FirebaseGoogleUser {
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export async function signInWithRedirectClient(): Promise<void> {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Firebase Google Auth Redirect Error:", error);
    throw error;
  }
}

export async function handleRedirectResult(): Promise<FirebaseGoogleUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      if (!user.email) {
        throw new Error("No email returned from Google authentication");
      }
      return {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    }
    return null;
  } catch (error) {
    console.error("Firebase getRedirectResult Error:", error);
    throw error;
  }
}
export { auth };
