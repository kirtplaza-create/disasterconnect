const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'disasterconnect-sys'
  });
}

const db = admin.firestore();

async function check() {
  const snapshot = await db.collection('residents').get();
  console.log(`Residents count: ${snapshot.size}`);
  
  const rps = await db.collection('reports').where('reportId', '==', 'RPT-SEED-001').get();
  console.log(`Test report found: ${rps.size > 0}`);
  
  process.exit(0);
}

check();
