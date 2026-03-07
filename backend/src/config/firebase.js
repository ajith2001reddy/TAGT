import process from "process";
import admin from "firebase-admin";

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const isTest = process.env.NODE_ENV === "test";

if (!admin.apps.length) {
  try {
    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else if (isTest) {
      // Mock initialization for testing if keys are missing
      admin.initializeApp({
        projectId: "test-project"
      });
    }
  } catch (e) {
    if (!isTest) {
      console.error("Firebase admin initialization failed:", e.message);
    }
  }
}

export default admin;