//firebaseConfig.ts

import { initializeApp, getApps, FirebaseApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyCZG9TaIdZlNx4be42KL3xd-YDI3RwrPs8",
  authDomain: "stylepitch-2.firebaseapp.com",
  projectId: "stylepitch-2",
  storageBucket: "stylepitch-2.firebasestorage.app",
  messagingSenderId: "256007802506",
  appId: "1:256007802506:web:6d1e2f5cbaa8c53993e773"
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
