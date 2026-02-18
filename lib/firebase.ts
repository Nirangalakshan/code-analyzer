import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GithubAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely
const app: FirebaseApp | null =
  (firebaseConfig.apiKey &&
    (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))) ||
  null;

const auth = (app ? getAuth(app) : ({ currentUser: null } as unknown)) as Auth;
const db = (app ? getFirestore(app) : ({} as unknown)) as Firestore;
const githubProvider = new GithubAuthProvider();

export { auth, db, githubProvider };
