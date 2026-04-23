<template>
  <LoginScreen v-if="!session" @login="handleLogin" />

  <LGUPortal
    v-else-if="session.role === 'lgu'"
    :user="session.user"
    :reports="reports"
    :deliveries="deliveries"
    :donations="donations"
    :inventory="inventory"
    @logout="isLogoutModalOpen = true"
  />

  <BarangayPortal
    v-else-if="session.role === 'barangay'"
    :user="session.user"
    :residents="residents"
    :reports="reports"
    :deliveries="deliveries"
    @logout="isLogoutModalOpen = true"
  />

  <DonorPortal
    v-else-if="session.role === 'donor'"
    :user="session.user"
    :reports="reports"
    :donations="donations"
    @logout="isLogoutModalOpen = true"
  />

  <!-- Logout Confirmation Modal -->
  <Transition name="fade">
    <div v-if="isLogoutModalOpen" class="logout-overlay" @click.self="isLogoutModalOpen = false">
      <div class="logout-modal">
        <div class="logout-modal-icon">
          <LogOut :size="32" />
        </div>
        <h3 class="logout-modal-title">Confirm Logout</h3>
        <p class="logout-modal-text">Are you sure you want to log out? Any unsaved changes might be lost.</p>
        <div class="logout-modal-actions">
          <button class="logout-btn-cancel" @click="isLogoutModalOpen = false">Cancel</button>
          <button class="logout-btn-confirm" @click="handleLogout">Log Out</button>
        </div>
      </div>
    </div>
  </Transition>
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
import { LogOut }     from 'lucide-vue-next'

const session = ref(null)
const loadingAuth = ref(true)
const isLogoutModalOpen = ref(false)

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
  isLogoutModalOpen.value = false;
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

/* LOGOUT MODAL STYLES */
.logout-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.logout-modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  width: 100%; max-width: 400px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.logout-modal-icon {
  width: 64px; height: 64px; border-radius: 20px;
  background: color-mix(in srgb, var(--color-warn), transparent 90%);
  color: var(--color-warn);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px;
}
.logout-modal-title { font-size: 20px; font-weight: 900; margin-bottom: 12px; color: var(--text-primary); }
.logout-modal-text { font-size: 14px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6; }
.logout-modal-actions { display: flex; gap: 12px; }
.logout-btn-cancel {
  flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);
  background: transparent; color: var(--text-secondary); font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.logout-btn-cancel:hover { background: var(--bg-body); color: var(--text-primary); }
.logout-btn-confirm {
  flex: 1; padding: 12px; border-radius: 12px; border: none;
  background: var(--color-warn); color: var(--bg-body); font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.logout-btn-confirm:hover { filter: brightness(1.1); transform: translateY(-1px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>