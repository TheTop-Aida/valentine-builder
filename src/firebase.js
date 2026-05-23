import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ ใส่ค่าจาก Firebase Console ของคุณที่นี่
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID",
};

export const app        = initializeApp(firebaseConfig);
export const auth       = getAuth(app);
export const db         = getFirestore(app);

// Secondary app สำหรับ Admin สร้าง user โดยไม่ถูก sign out
export const secondaryApp  = initializeApp(firebaseConfig, 'secondary');
export const secondaryAuth = getAuth(secondaryApp);
