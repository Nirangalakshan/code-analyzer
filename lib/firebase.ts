import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GithubAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtN40CW21dlfJ2LR3sYuut9c4I1Ri5IHw",
  authDomain: "code-analyzer-49332.firebaseapp.com",
  projectId: "code-analyzer-49332",
  storageBucket: "code-analyzer-49332.firebasestorage.app",
  messagingSenderId: "27677318489",
  appId: "1:27677318489:web:75a9ae9d3ad72387d44048",
};

// Initialize Firebase safely
const app: FirebaseApp | null =
  (firebaseConfig.apiKey &&
    (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))) ||
  null;

const auth = (
  app
    ? getAuth(app)
    : ({
        currentUser: null,
        onAuthStateChanged: (nextOrObserver: any) => {
          if (typeof nextOrObserver === "function") nextOrObserver(null);
          return () => {};
        },
        onIdTokenChanged: (nextOrObserver: any) => {
          if (typeof nextOrObserver === "function") nextOrObserver(null);
          return () => {};
        },
      } as unknown)
) as Auth;
const db = (app ? getFirestore(app) : ({} as unknown)) as Firestore;
const githubProvider = new GithubAuthProvider();

export { auth, db, githubProvider };
