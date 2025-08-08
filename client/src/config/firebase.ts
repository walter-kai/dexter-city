import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - hardcoded for dexter-city-de124 project
const firebaseConfig = {
  apiKey: "AIzaSyBVW5wB4jLNx2vSyGqhv5mVqJiZfX0kzZs",
  authDomain: "dexter-city-de124.firebaseapp.com",
  projectId: "dexter-city-de124",
  storageBucket: "dexter-city-de124.firebasestorage.app",
  messagingSenderId: "295613383826",
  appId: "1:295613383826:web:b020b465887d7cd277d24b",
  measurementId: "G-DWBB5W7H1Y"
};

// Log configuration for debugging
console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  apiKey: firebaseConfig.apiKey.substring(0, 20) + '...' // Show first 20 chars for debugging
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;