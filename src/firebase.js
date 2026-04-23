import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCXKmGUhnEJu87vvXf1x4Czo2qBORg7oiw",
  authDomain: "disasterconnect3.firebaseapp.com",
  projectId: "disasterconnect3",
  storageBucket: "disasterconnect3.firebasestorage.app",
  messagingSenderId: "344193773760",
  appId: "1:344193773760:web:5c484e662a9f0694b9bd25"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
