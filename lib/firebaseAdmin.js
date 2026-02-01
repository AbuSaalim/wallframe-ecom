import admin from "firebase-admin";

let app;

if (!admin.apps.length) {
  // For server-side: use environment variable with service account
  if (process.env.FIREBASE_ADMIN_SDK) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_SDK, "base64").toString("utf-8")
    );
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    console.warn("FIREBASE_ADMIN_SDK not configured for backend operations");
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore?.();

export default admin;
