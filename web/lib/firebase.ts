import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key_for_build",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy_domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy_project_id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy_bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy_sender",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy_app_id",
};

const app = typeof window !== "undefined" && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0] || initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();