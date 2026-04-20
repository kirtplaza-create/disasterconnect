import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCKrR9TR9UJdkUiMBrjaylbMMBDkIm777o",
  authDomain: "disasterconnect-sys.firebaseapp.com",
  projectId: "disasterconnect-sys",
  storageBucket: "disasterconnect-sys.firebasestorage.app",
  messagingSenderId: "883950967469",
  appId: "1:883950967469:web:6786eac59e802c2836c424"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
