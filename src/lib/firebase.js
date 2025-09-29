// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";

// ---- Config depuis .env (pense à relancer `npm run dev` après modif) ----
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ---- Sanity check DEV : alerte immédiate si une clé manque / est suspecte ----
function assertFirebaseConfig(cfg) {
  const required = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"];
  const missing = required.filter((k) => !cfg?.[k]);
  if (missing.length) {
    throw new Error(
      "Config Firebase manquante (.env.local) : " + missing.join(", ") +
      "\nEx.: \n" +
      "VITE_FIREBASE_API_KEY=...\n" +
      "VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com\n" +
      "VITE_FIREBASE_PROJECT_ID=xxx\n" +
      "VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com\n" +
      "VITE_FIREBASE_APP_ID=1:...:web:...\n"
    );
  }
  if (cfg.apiKey && !cfg.apiKey.startsWith("AIza")) {
    console.warn("⚠️ VITE_FIREBASE_API_KEY semble inhabituel (ne commence pas par 'AIza').");
  }
  if (cfg.storageBucket && !/\.(appspot\.com|firebasestorage\.app)$/.test(cfg.storageBucket)) {
    console.warn("⚠️ VITE_FIREBASE_STORAGE_BUCKET semble inhabituel :", cfg.storageBucket);
  }
}
if (import.meta.env.DEV) {
  assertFirebaseConfig(firebaseConfig);
}

// ---- Init ----
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Persistance locale (reste connecté après refresh / onglet)
setPersistence(auth, browserLocalPersistence).catch((e) => {
  // En navigation privée Safari/iOS cela peut échouer → on log seulement
  console.warn("Auth persistence warning:", e?.message || e);
});

// ---- Helpers Email/Password ----
export const listenAuth = (cb) => onAuthStateChanged(auth, cb);
export const login = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const register = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);

// ---- Social providers ----
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const redirectWithGoogle = () => signInWithRedirect(auth, googleProvider);

export const loginWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const redirectWithFacebook = () => signInWithRedirect(auth, facebookProvider);

// ---- Hook pratique pour récupérer l'utilisateur courant ----
export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = listenAuth((u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return { user, loading };
}
