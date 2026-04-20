<template>
  <div class="page">
    <div class="blob blob-top" />
    <div class="blob blob-bottom" />

    <div class="container fade-up">

      <!-- HEADER -->
      <div class="header">
        <div class="logo float">
          <Zap :size="36" color="#00D4FF" fill="#00D4FF33" />
        </div>
        <h1 class="title">DisasterConnect</h1>
        <p class="tagline">AI-ENHANCED DISASTER MANAGEMENT SYSTEM</p>
        <p class="sub">Select your portal to continue</p>
      </div>

      <!-- TWO COLUMN -->
      <div class="two-col">

        <!-- LEFT: portal cards -->
        <div class="role-col">
          <div
            v-for="acc in PORTALS"
            :key="acc.role"
            class="role-card"
            :style="{
              background:  selected === acc.role ? acc.color + '10' : '#0D1219',
              borderColor: selected === acc.role ? acc.color        : '#1A2535',
            }"
            @click="selectRole(acc)"
            @mouseenter="e => { if (selected !== acc.role) e.currentTarget.style.borderColor = acc.color + '55' }"
            @mouseleave="e => { if (selected !== acc.role) e.currentTarget.style.borderColor = '#1A2535' }"
          >
            <div class="avatar" :style="{ background: acc.color + '15', border: `1px solid ${acc.color}33` }">
              <component :is="acc.icon" :size="24" :color="acc.color" />
            </div>
            <div class="role-info">
              <div class="role-name">{{ acc.name }}</div>
              <div class="role-subtitle">{{ acc.subtitle }}</div>
            </div>
            <div class="role-right">
              <span class="role-badge" :style="{ background: acc.color + '18', border: `1px solid ${acc.color}44`, color: acc.color }">
                {{ (acc.role || 'user').toUpperCase() }}
              </span>
              <span v-if="selected === acc.role" class="selected-tag" :style="{ color: acc.color }">▸ SELECTED</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: login form -->
        <div class="form-card" :style="{ borderColor: selectedAcc ? selectedAcc.color + '44' : '#1A2535' }">
          <div class="form-heading">
            <h2 class="form-title">{{ selectedAcc ? `Sign in to ${selectedAcc.name}` : 'Sign In' }}</h2>
            <p class="form-sub">{{ selectedAcc ? 'Please enter your authorized email and password' : 'Select a portal on the left to continue' }}</p>
          </div>

          <div class="field">
            <label class="field-label">EMAIL ADDRESS</label>
            <input v-model="email" type="email" placeholder="email@example.com" class="field-input"
              @focus="e => e.target.style.borderColor = selectedAcc?.color || '#00D4FF'"
              @blur="e  => e.target.style.borderColor = '#1A2535'"
            />
          </div>

          <div class="field">
            <label class="field-label">PASSWORD</label>
            <input v-model="password" type="password" placeholder="Enter password" class="field-input"
              @focus="e => e.target.style.borderColor = selectedAcc?.color || '#00D4FF'"
              @blur="e  => e.target.style.borderColor = '#1A2535'"
              @keydown.enter="handleLogin"
            />
          </div>

          <div v-if="error" class="error-msg">
            <AlertTriangle :size="14" style="margin-right: 4px;" />
            {{ error }}
          </div>

          <button class="login-btn"
            :style="{ background: selectedAcc ? selectedAcc.color : '#00D4FF', opacity: (!selected || loading) ? 0.5 : 1, cursor: (!selected || loading) ? 'not-allowed' : 'pointer' }"
            :disabled="!selected || loading"
            @click="handleLogin"
          >
            <span v-if="loading" class="spinner" />
            {{ loading ? 'Signing in...' : `Enter ${selected ? selected.toUpperCase() + ' Portal' : 'Portal'} →` }}
          </button>
        </div>

      </div>

      <div class="footer">DISASTERCONNECT · DAVAO REGION DRRMO · SECURE PORTAL ACCESS</div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { Zap, Landmark, Home, HeartHandshake, AlertTriangle } from 'lucide-vue-next'

const emit = defineEmits(['login'])

const PORTALS = [
  { role:'lgu',      name:'LGU Operations Center Portal',   subtitle:'Davao City DRRMO', icon: Landmark, color:'#00D4FF' },
  { role:'barangay', name:'Barangay Portal',  subtitle:'Davao City',       icon: Home, color:'#FFD23F' },
  { role:'donor',    name:'Donor / Volunteer Portal',        subtitle:'Public Portal',    icon: HeartHandshake, color:'#00E5A0' },
]

const selected = ref(null)
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

const selectedAcc = computed(() => PORTALS.find(a => a.role === selected.value) || null)

function selectRole(acc) {
  selected.value = acc.role
  error.value    = ''
}

async function handleLogin() {
  if (!selected.value) { error.value = 'Please select a role first.'; return }
  if (!email.value || !password.value) { error.value = 'Email and password are required.'; return }
  
  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // The actual login transition is handled in App.vue automatically via onAuthStateChanged
  } catch (err) {
    let msg = 'Authentication failed. Please check your credentials.'
    if (err.code === 'auth/user-not-found') msg = 'No account found with this email.'
    if (err.code === 'auth/wrong-password') msg = 'Incorrect password.'
    error.value = msg
    console.error(err)
    loading.value = false
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');

@keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes float  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
@keyframes spin   { to { transform:rotate(360deg) } }

.fade-up { animation: fadeUp 0.5s ease forwards; }
.float   { animation: float 3.5s ease-in-out infinite; }

.page {
  min-height: 100vh;
  background: #060A0F;
  color: #E2EAF4;
  font-family: 'Outfit', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.blob { position:fixed; border-radius:50%; pointer-events:none; filter:blur(70px); }
.blob-top    { top:-200px;    right:-200px; width:600px; height:600px; background:#00D4FF06; }
.blob-bottom { bottom:-200px; left:-200px;  width:500px; height:500px; background:#00E5A005; }

.container { width:100%; max-width:980px; position:relative; z-index:1; }

.header      { text-align:center; margin-bottom:48px; }
.logo        { font-size:36px; margin-bottom:12px; display:block; }
.title       {
  font-size:32px; font-weight:900; letter-spacing:-0.02em;
  background: linear-gradient(135deg, #00D4FF, #00E5A0);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom:6px;
}
.tagline { font-family:'DM Mono',monospace; font-size:13px; color:#4A6080; letter-spacing:0.1em; }
.sub     { font-size:12px; color:#4A6080; margin-top:8px; }

.two-col {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  align-items: start;
}

.role-col  { display:flex; flex-direction:column; gap:12px; }
.role-card {
  border: 2px solid #1A2535;
  border-radius: 10px;
  padding: 1.1rem 1.4rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar {
  width:48px; height:48px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  font-size:22px; flex-shrink:0;
}
.role-info     { flex:1; }
.role-name     { font-size:15px; font-weight:700; margin-bottom:3px; }
.role-subtitle { font-size:12px; color:#4A6080; }
.role-right    { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0; }
.role-badge    { font-size:10px; padding:3px 10px; border-radius:3px; font-family:'DM Mono',monospace; letter-spacing:0.06em; white-space:nowrap; }
.selected-tag  { font-size:10px; font-family:'DM Mono',monospace; }

.form-card {
  background: #0D1219;
  border: 1px solid #1A2535;
  border-radius: 12px;
  padding: 1.75rem;
  transition: border-color 0.3s;
}
.form-heading { margin-bottom:22px; }
.form-title   { font-size:20px; font-weight:800; margin-bottom:4px; }
.form-sub     { font-size:12px; color:#4A6080; }

.field       { margin-bottom:16px; }
.field-label { display:block; font-size:11px; color:#4A6080; font-family:'DM Mono',monospace; letter-spacing:0.08em; margin-bottom:6px; }
.field-input {
  width:100%; background:#060A0F; border:1px solid #1A2535; border-radius:6px;
  padding:11px 14px; color:#E2EAF4; font-size:13px; font-family:'Outfit',sans-serif;
  outline:none; transition:border-color 0.2s;
}

.error-msg { color:#FF3B5C; font-size:12px; font-family:'DM Mono',monospace; margin-bottom:12px; }

.login-btn {
  width:100%; padding:12px; border:none; border-radius:6px; color:#060A0F;
  font-size:14px; font-weight:700; letter-spacing:0.04em; transition:opacity 0.2s;
  display:flex; align-items:center; justify-content:center; gap:8px;
  font-family:'Outfit',sans-serif; margin-top:4px;
}
.spinner {
  width:14px; height:14px; border:2px solid #06060F44; border-top:2px solid #060A0F;
  border-radius:50%; animation:spin 1s linear infinite; display:inline-block;
}

.footer { text-align:center; margin-top:36px; font-size:11px; color:#4A6080; font-family:'DM Mono',monospace; letter-spacing:0.06em; }
</style>