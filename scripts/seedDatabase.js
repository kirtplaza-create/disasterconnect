import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXKmGUhnEJu87vvXf1x4Czo2qBORg7oiw",
  authDomain: "disasterconnect3.firebaseapp.com",
  projectId: "disasterconnect3",
  storageBucket: "disasterconnect3.firebasestorage.app",
  messagingSenderId: "344193773760",
  appId: "1:344193773760:web:5c484e662a9f0694b9bd25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

const USERS = [
  { id: 'user_lgu', role: 'lgu', email: 'lgu_admin@disasterconnect.local', password: 'lgu2025', name: 'LGU Operations Center' },
  { id: 'user_brgy', role: 'barangay', email: 'brgy_riverside@disasterconnect.local', password: 'brgy2025', name: 'Barangay Riverside', brgyName: 'Riverside' },
  { id: 'user_donor', role: 'donor', email: 'donor@disasterconnect.local', password: 'donate2025', name: 'Public Donor' },
];

const REPORTS = [
  {
    id: 'RPT-001',
    brgy: 'Riverside',
    muni: 'Butuan City',
    dtype: 'Flood',
    desc: 'Heavy rainfall caused river overflow. Area is partially submerged. Need immediate evacuation and food supplies for 50 families.',
    families: 50,
    individuals: 250,
    evacuees: 120,
    injured: 2,
    elderly: 15,
    children: 45,
    pregnant: 3,
    disabled: 5,
    severity: 'High',
    urgency: 'Critical',
    status: 'pending',
    date: '2025-05-10',
    foodNeeded: 100,
    waterNeeded: 200,
    medNeeded: 10,
    vulnScore: 75,
  },
  {
    id: 'RPT-002',
    brgy: 'Mountain View',
    muni: 'Butuan City',
    dtype: 'Landslide',
    desc: 'Minor landslide blocked the main road. 10 families isolated. No casualties but food stock is low.',
    families: 10,
    individuals: 55,
    evacuees: 0,
    injured: 0,
    elderly: 4,
    children: 12,
    pregnant: 1,
    disabled: 0,
    severity: 'Moderate',
    urgency: 'Moderate',
    status: 'approved',
    date: '2025-05-11',
    foodNeeded: 30,
    waterNeeded: 50,
    medNeeded: 2,
    vulnScore: 40,
  }
];

const INVENTORY = [
  { id: 'INV-001', item: 'Rice (50kg Bag)', category: 'Food', available: 120, unit: 'bags', low: 20 },
  { id: 'INV-002', item: 'Canned Sardines', category: 'Food', available: 850, unit: 'cans', low: 100 },
  { id: 'INV-003', item: 'Bottled Water (1L)', category: 'Water', available: 2100, unit: 'bottles', low: 500 },
  { id: 'INV-004', item: 'First Aid Kit', category: 'Medical', available: 45, unit: 'kits', low: 10 },
  { id: 'INV-005', item: 'Blankets', category: 'Relief', available: 300, unit: 'pcs', low: 50 },
];

const DONATIONS = [
  {
    id: 'DON-001',
    donor: 'Global Relief NGO',
    type: 'Goods',
    items: [{ item: 'Rice (50kg Bag)', qty: 50 }],
    totalValue: 75000,
    date: '2025-05-08',
    status: 'approved'
  },
  {
    id: 'DON-002',
    donor: 'SM Foundation',
    type: 'Cash',
    amount: 100000,
    date: '2025-05-09',
    status: 'pending'
  }
];

const DELIVERIES = [
  {
    id: 'DEL-001',
    brgy: 'Riverside',
    reportId: 'RPT-001',
    items: [{ item: 'Rice (50kg Bag)', qty: 20 }, { item: 'Bottled Water (1L)', qty: 500 }],
    status: 'dispatched',
    dispatchedAt: '2025-05-10T14:00:00Z',
    eta: '2 hours'
  }
];

const RESIDENTS = [
    { 
      id: 'RES-001', 
      familyName: 'Dela Cruz', 
      contactNo: '09123456789',
      status: 'At Home', 
      brgy: 'Riverside', 
      vulnerableGroups: [], 
      members: [{ fullName: 'Juan Dela Cruz', age: '45' }, { fullName: 'Ana Dela Cruz', age: '40' }],
      needs: [],
      photo: null
    },
    { 
      id: 'RES-002', 
      familyName: 'Santos', 
      contactNo: '09987654321',
      status: 'Evacuated', 
      brgy: 'Riverside', 
      vulnerableGroups: ['Elderly'], 
      members: [{ fullName: 'Maria Santos', age: '72' }],
      needs: ['Food', 'Water'],
      photo: null
    },
];

// ─── SEED FUNCTION ───────────────────────────────────────────────────────────

async function seed() {
  console.log("🚀 Starting database seeding...");

  // 1. Setup Users
  console.log("\n--- Setting up Users ---");
  for (const u of USERS) {
    try {
      let uid;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
        uid = userCredential.user.uid;
        console.log(`✅ Created Auth for: ${u.email}`);
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          const userCredential = await signInWithEmailAndPassword(auth, u.email, u.password);
          uid = userCredential.user.uid;
          console.log(`ℹ️ User ${u.email} already exists.`);
        } else {
          throw e;
        }
      }

      await setDoc(doc(db, 'users', uid), {
        email: u.email,
        role: u.role,
        name: u.name,
        brgyName: u.brgyName || null,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✅ Profile synced for: ${u.email}`);

    } catch (e) {
      console.error(`❌ Error with user ${u.email}:`, e.message);
    }
  }

  // 2. Setup Collections
  const collections = [
    { name: 'reports', data: REPORTS },
    { name: 'inventory', data: INVENTORY },
    { name: 'donations', data: DONATIONS },
    { name: 'deliveries', data: DELIVERIES },
    { name: 'residents', data: RESIDENTS },
  ];

  for (const col of collections) {
    console.log(`\n--- Seeding ${col.name} ---`);
    for (const item of col.data) {
      try {
        await setDoc(doc(db, col.name, item.id), item);
        console.log(`✅ Added ${col.name} item: ${item.id}`);
      } catch (e) {
        console.error(`❌ Error adding to ${col.name}:`, e.message);
      }
    }
  }

  console.log("\n✨ Database seeding completed!");
  process.exit(0);
}

seed();
