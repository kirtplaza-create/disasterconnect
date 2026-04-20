import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyCKrR9TR9UJdkUiMBrjaylbMMBDkIm777o",
  authDomain: "disasterconnect-sys.firebaseapp.com",
  projectId: "disasterconnect-sys",
  storageBucket: "disasterconnect-sys.firebasestorage.app",
  messagingSenderId: "883950967469",
  appId: "1:883950967469:web:6786eac59e802c2836c424"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const USERS = [
  { role: 'lgu',      email: 'lgu_admin@disasterconnect.local',      password: 'lgu2025',    name: 'LGU Operations Center' },
  { role: 'barangay', email: 'brgy_riverside@disasterconnect.local', password: 'brgy2025',   name: 'Barangay Riverside', brgyName: 'Riverside' },
  { role: 'donor',    email: 'donor@disasterconnect.local',          password: 'donate2025', name: 'Public Donor' },
];

async function setup() {
  console.log("Setting up Firebase Users...");
  
  for (const u of USERS) {
    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
      const user = userCredential.user;
      console.log(`Created Auth for: ${u.email}`);
      
      // 2. Set Role in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: u.email,
        role: u.role,
        name: u.name,
        brgyName: u.brgyName || null,
        createdAt: new Date().toISOString()
      });
      console.log(`Created Profile for: ${u.email} (${u.role})`);
      
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`User ${u.email} already exists. Updating profile...`);
        // If it exists, let's login and update profile anyway just in case
        const userCredential = await signInWithEmailAndPassword(auth, u.email, u.password);
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          email: u.email,
          role: u.role,
          name: u.name,
          brgyName: u.brgyName || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Updated Profile for: ${u.email}`);
      } else {
        console.error(`Error creating ${u.email}:`, e);
      }
    }
  }
  console.log("Done!");
  process.exit(0);
}

setup();
