<template>
  <LoginScreen v-if="!session" @login="handleLogin" />

  <LGUPortal
    v-else-if="session.role === 'lgu'"
    :user="session.user"
    :reports="reports"
    :deliveries="deliveries"
    :donations="donations"
    :inventory="inventory"
    @logout="handleLogout"
  />

  <BarangayPortal
    v-else-if="session.role === 'barangay'"
    :user="session.user"
    :residents="residents"
    :reports="reports"
    :deliveries="deliveries"
    @logout="handleLogout"
  />

  <DonorPortal
    v-else-if="session.role === 'donor'"
    :user="session.user"
    :reports="reports"
    :donations="donations"
    @logout="handleLogout"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'

import LoginScreen    from './LoginScreen.vue'
import LGUPortal      from './LGUPortal.vue'
import BarangayPortal from './BarangayPortal.vue'
import DonorPortal    from './DonorPortal.vue'

const session = ref(null)
const loadingAuth = ref(true)

// THEME MANAGEMENT
const isLightMode = ref(localStorage.getItem('theme') === 'light')

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
}

watch(isLightMode, (val) => {
  if (val) {
    document.body.classList.add('light-mode')
    localStorage.setItem('theme', 'light')
  } else {
    document.body.classList.remove('light-mode')
    localStorage.setItem('theme', 'dark')
  }
}, { immediate: true })

provide('isLightMode', isLightMode)
provide('toggleTheme', toggleTheme)

// Reactive Database references for the entire app. Eventually synced via onSnapshot
const residents  = ref([])
const reports    = ref([])
const deliveries = ref([])
const donations  = ref([])
const inventory  = ref([])

let unsubRefs = []

// Setup real-time listeners for all portal data collections
function setupRealtimeListeners() {
  unsubRefs.push(
    onSnapshot(collection(db, 'residents'), (snap) => {
      residents.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }),
    onSnapshot(collection(db, 'reports'), (snap) => {
      reports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }),
    onSnapshot(collection(db, 'deliveries'), (snap) => {
      deliveries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }),
    onSnapshot(collection(db, 'donations'), (snap) => {
      donations.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }),
    onSnapshot(collection(db, 'inventory'), (snap) => {
      inventory.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  )
}

function clearRealtimeListeners() {
  unsubRefs.forEach(unsub => unsub())
  unsubRefs = []
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, fetch their Role from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        session.value = { role: userSnap.data().role, user: userSnap.data() };
        setupRealtimeListeners() // Setup sync when authed
      } else {
        console.error("Authenticated but missing user permissions in Firestore.");
        session.value = null;
      }
    } else {
      session.value = null;
      clearRealtimeListeners() // Clear sync on logout
    }
    loadingAuth.value = false;
  })
})

onUnmounted(() => clearRealtimeListeners())

function handleLogin() {
  // Logic shifted to onAuthStateChanged. LoginScreen triggers signInWithEmailAndPassword.
}

async function handleLogout() {
  await signOut(auth);
  session.value = null;
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { 
  background: var(--bg-body); 
  color: var(--text-primary); 
  font-family: 'Outfit','Segoe UI',sans-serif; 
  min-height: 100vh; 
  transition: background 0.3s, color 0.3s;
}
input, select, textarea, button { font-family: 'Outfit','Segoe UI',sans-serif; outline: none; }
button { cursor: pointer; }
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background: var(--scrollbar-track)}
::-webkit-scrollbar-thumb{background: var(--scrollbar-thumb);border-radius:2px}
</style>