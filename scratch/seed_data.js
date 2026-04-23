import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

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

const BRGY = "Brgy Riverside";
const MUNI = "Butuan City";

const familyNames = [
    "HAYA", "SANTOS", "REYES", "CRUZ", "BAUTISTA", "GARCIA", "LOPEZ", "PASCUAL", "TORRES", "MENDEZ",
    "CASTILLO", "GONZALES", "VILLANUEVA", "RAMOS", "FERRER", "QUIRINO", "VALDEZ", "SALVADOR", "EUGENIO", "MANALO",
    "DE GUZMAN", "DEL ROSARIO", "MENDOZA", "SANTIAGO", "BALTAZAR", "AQUINO", "MERCADO", "DOMINGO", "SISON", "SORIANO"
];

const firstNames = [
    "Juan", "Maria", "Jose", "Ana", "Ricardo", "Liza", "Antonio", "Elena", "Pedro", "Sofia",
    "Manuel", "Rosa", "Emilio", "Clara", "Andres", "Luisa", "Felipe", "Teresa", "Mateo", "Isabel"
];

const needsOpts = ['Food', 'Water', 'Medicine', 'Blanket'];
const vulnOpts = ['Elderly', 'Children', 'Pregnant', 'Disabled', 'PWD', 'Solo Parent'];
const statusOpts = ['At Home', 'Evacuated', 'Missing', 'Relocated'];

async function seed() {
    console.log("🚀 Starting data seed...");

    // 1. Clear existing residents in this brgy (optional, but good for clean trial)
    // For simplicity, we just add new ones.

    let totalIndividuals = 0;
    let totalElderly = 0;
    let totalChildren = 0;
    let totalFamilies = 60;
    let evacuees = 0;
    
    let residentsToUpload = [];

    for (let i = 1; i <= totalFamilies; i++) {
        const familyName = familyNames[i % familyNames.length] + (i > familyNames.length ? " " + Math.floor(i/familyNames.length) : "");
        const numMembers = Math.floor(Math.random() * 4) + 2; // 2 to 5 members
        const members = [];
        let familyIsVulnerable = false;
        const familyVulnGroups = new Set();

        for (let j = 0; j < numMembers; j++) {
            const age = Math.floor(Math.random() * 80) + 1;
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            members.push({ fullName: `${firstName} ${familyName}`, age: String(age) });
            
            if (age > 60) {
                totalElderly++;
                familyVulnGroups.add('Elderly');
            }
            if (age < 17) {
                totalChildren++;
                familyVulnGroups.add('Children');
            }
            if (j === 0 && Math.random() < 0.1) familyVulnGroups.add('Pregnant');
            if (Math.random() < 0.05) familyVulnGroups.add('Disabled');
        }

        totalIndividuals += numMembers;
        const status = Math.random() < 0.4 ? 'Evacuated' : 'At Home';
        if (status === 'Evacuated') evacuees += numMembers;

        const needs = [];
        if (Math.random() < 0.7) needs.push('Food');
        if (Math.random() < 0.6) needs.push('Water');
        if (Math.random() < 0.3) needs.push('Medicine');
        if (Math.random() < 0.4) needs.push('Blanket');

        const entryId = `FAM-SEED-${Date.now()}-${i}`;
        const entry = {
            id: entryId,
            familyName: familyName,
            contactNo: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
            status: status,
            otherNeeds: "",
            photo: null, 
            members: members,
            needs: needs,
            vulnerableGroups: Array.from(familyVulnGroups),
            brgy: BRGY, // Added for LGU filtering
            muni: MUNI,
            updatedAt: new Date().toISOString()
        };

        residentsToUpload.push(entry);
    }

    console.log(`📦 Generated ${totalFamilies} families (${totalIndividuals} individuals)`);

    // Batch upload (Firestore setDoc)
    for (const r of residentsToUpload) {
        await setDoc(doc(db, 'residents', r.id), r);
    }
    console.log("✅ Residents seeded.");

    // 2. Create a simulated report
    const reportRef = "RPT-SEED-001";
    const report = {
        id: reportRef,
        brgy: BRGY, muni: MUNI,
        dtype: 'Flood', severity: 'Moderate', urgency: 'Pending',
        families: totalFamilies,
        individuals: totalIndividuals,
        evacuees: evacuees,
        injured: Math.floor(Math.random() * 10),
        elderly: totalElderly,
        children: totalChildren,
        desc: "Heavy rainfall causing 2-foot flooding in low-lying areas. Several families moved to evacuation centers. Access to main roads is partially blocked.",
        status: 'pending', 
        date: new Date().toISOString().split('T')[0],
        foodNeeded: totalIndividuals, 
        waterNeeded: totalIndividuals * 3,
        medNeeded: Math.ceil(totalIndividuals * 0.05),
        blanketNeeded: totalFamilies,
        vulnScore: 0, 
        verified: false,
        createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'reports', reportRef), report);
    console.log(`✅ Report ${reportRef} seeded for LGU dashboard.`);

    console.log("\n✨ SEEDING COMPLETE!");
    console.log(`   Location: ${BRGY}, ${MUNI}`);
    console.log(`   Population: ${totalIndividuals}`);
    console.log(`   Elderly: ${totalElderly} | Children: ${totalChildren}`);
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
