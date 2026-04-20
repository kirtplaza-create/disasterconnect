<template>
  <div class="page">
    <div class="blob blob-top" />
    <div class="blob blob-bottom" />

    <div class="container fade-up">

      <!-- HEADER -->
      <div class="header">
        <div class="theme-switch-wrapper">
          <button class="theme-toggle-btn" @click="toggleTheme" :title="isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
            <Sun v-if="isLightMode" :size="16" />
            <Moon v-else :size="16" />
          </button>
        </div>
        <div class="logo float">
          <Zap :size="36" color="var(--color-accent)" :fill="`color-mix(in srgb, var(--color-accent), transparent 80%)`" />
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
              background:  selected === acc.role ? `color-mix(in srgb, ${acc.color}, transparent 94%)` : 'var(--bg-surface)',
              borderColor: selected === acc.role ? acc.color : 'var(--border-color)',
            }"
            @click="selectRole(acc)"
            @mouseenter="e => { if (selected !== acc.role) e.currentTarget.style.borderColor = acc.color + '55' }"
            @mouseleave="e => { if (selected !== acc.role) e.currentTarget.style.borderColor = 'var(--border-color)' }"
          >
            <div class="avatar" :style="{ background: `color-mix(in srgb, ${acc.color}, transparent 91%)`, border: `1px solid color-mix(in srgb, ${acc.color}, transparent 80%)` }">
              <component :is="acc.icon" :size="24" :color="acc.color" />
            </div>
            <div class="role-info">
              <div class="role-name">{{ acc.name }}</div>
              <div class="role-subtitle">{{ acc.subtitle }}</div>
            </div>
            <div class="role-right">
              <span class="role-badge" :style="{ background: `color-mix(in srgb, ${acc.color}, transparent 90%)`, border: `1px solid color-mix(in srgb, ${acc.color}, transparent 73%)`, color: acc.color }">
                {{ (acc.role || 'user').toUpperCase() }}
              </span>
              <span v-if="selected === acc.role" class="selected-tag" :style="{ color: acc.color }">▸ SELECTED</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: login form -->
        <div class="form-card" :style="{ borderColor: selectedAcc ? `color-mix(in srgb, ${selectedAcc.color}, transparent 73%)` : 'var(--border-color)' }">
          <div class="form-heading">
            <h2 class="form-title">{{ selectedAcc ? `Sign in to ${selectedAcc.name}` : 'Sign In' }}</h2>
            <p class="form-sub">{{ selectedAcc ? 'Please enter your authorized email and password' : 'Select a portal on the left to continue' }}</p>
          </div>

          <div class="field">
            <label class="field-label">EMAIL ADDRESS</label>
            <input v-model="email" type="email" placeholder="email@example.com" class="field-input"
              @focus="e => e.target.style.borderColor = selectedAcc?.color || 'var(--color-accent)'"
              @blur="e  => e.target.style.borderColor = 'var(--border-color)'"
            />
          </div>

          <div class="field">
            <label class="field-label">PASSWORD</label>
            <input v-model="password" type="password" placeholder="Enter password" class="field-input"
              @focus="e => e.target.style.borderColor = selectedAcc?.color || 'var(--color-accent)'"
              @blur="e  => e.target.style.borderColor = 'var(--border-color)'"
              @keydown.enter="handleLogin"
            />
          </div>

          <div v-if="error" class="error-msg">
            <AlertTriangle :size="14" style="margin-right: 4px;" />
            {{ error }}
          </div>

          <button class="login-btn"
            :style="{ background: selectedAcc ? selectedAcc.color : 'var(--color-accent)', opacity: (!selected || loading) ? 0.5 : 1, cursor: (!selected || loading) ? 'not-allowed' : 'pointer' }"
            :disabled="!selected || loading"
            @click="handleLogin"
          >
            <span v-if="loading" class="spinner" />
            {{ loading ? 'Signing in...' : `Enter ${selected ? selected.toUpperCase() + ' Portal' : 'Portal'} →` }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, inject } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { Zap, Landmark, Home, HeartHandshake, AlertTriangle, Sun, Moon } from 'lucide-vue-next'

const isLightMode = inject('isLightMode')
const toggleTheme = inject('toggleTheme')

const emit = defineEmits(['login'])

const PORTALS = [
  { role:'lgu',      name:'LGU Operations Center Portal',   subtitle:'Davao City DRRMO', icon: Landmark, color:'var(--color-accent)' },
  { role:'barangay', name:'Barangay Portal',  subtitle:'Davao City',       icon: Home, color:'var(--color-warn)' },
  { role:'donor',    name:'Donor / Volunteer Portal',        subtitle:'Public Portal',    icon: HeartHandshake, color:'var(--color-success)' },
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
  background: var(--bg-body);
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: background 0.3s, color 0.3s;
}

.blob { position:fixed; border-radius:50%; pointer-events:none; filter:blur(70px); }
.blob-top    { top:-200px;    right:-200px; width:600px; height:600px; background:color-mix(in srgb, var(--color-accent), transparent 97%); }
.blob-bottom { bottom:-200px; left:-200px;  width:500px; height:500px; background:color-mix(in srgb, var(--color-success), transparent 98%); }

.container { width:100%; max-width:980px; position:relative; z-index:1; }

.header      { text-align:center; margin-bottom:48px; position: relative; }
.theme-switch-wrapper { position: fixed; top: 24px; right: 24px; z-index: 100; }
.theme-toggle-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  transition: all 0.1s;
  cursor: pointer;
}
.theme-toggle-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, black, transparent 90%);
}
.theme-toggle-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 2px 4px color-mix(in srgb, black, transparent 90%);
}

.logo        { font-size:36px; margin-bottom:12px; display:block; }
.title       {
  font-size:32px; font-weight:900; letter-spacing:-0.02em;
  background: linear-gradient(135deg, var(--color-accent), var(--color-success));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom:6px;
}
.tagline { font-family:'DM Mono',monospace; font-size:13px; color: var(--text-secondary); letter-spacing:0.1em; }
.sub     { font-size:12px; color: var(--text-secondary); margin-top:8px; }

.two-col {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  align-items: start;
}

.role-col  { display:flex; flex-direction:column; gap:12px; }
.role-card {
  border: 2px solid var(--border-color);
  background: var(--bg-surface);
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
.role-subtitle { font-size:12px; color: var(--text-secondary); }
.role-right    { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0; }
.role-badge    { font-size:10px; padding:3px 10px; border-radius:3px; font-family:'DM Mono',monospace; letter-spacing:0.06em; white-space:nowrap; }
.selected-tag  { font-size:10px; font-family:'DM Mono',monospace; }

.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.75rem;
  transition: border-color 0.3s;
}
.form-heading { margin-bottom:22px; }
.form-title   { font-size:20px; font-weight:800; margin-bottom:4px; }
.form-sub     { font-size:12px; color:var(--text-secondary); }

.field       { margin-bottom:16px; }
.field-label { display:block; font-size:11px; color: var(--text-secondary); font-family:'DM Mono',monospace; letter-spacing:0.08em; margin-bottom:6px; }
.field-input {
  width:100%; background: var(--bg-input); border:1px solid var(--border-color); border-radius:6px;
  padding:11px 14px; color: var(--text-primary); font-size:13px; font-family:'Outfit',sans-serif;
  outline:none; transition:border-color 0.2s;
}

.error-msg { color:var(--color-danger); font-size:12px; font-family:'DM Mono',monospace; margin-bottom:12px; }

.login-btn {
  width:100%; padding:12px; border:none; border-radius:6px; color:var(--bg-body);
  font-size:14px; font-weight:700; letter-spacing:0.04em; transition:opacity 0.2s;
  display:flex; align-items:center; justify-content:center; gap:8px;
  font-family:'Outfit',sans-serif; margin-top:4px;
}
.spinner {
  width:14px; height:14px; border:2px solid color-mix(in srgb, var(--bg-body), transparent 80%); border-top:2px solid var(--bg-body);
  border-radius:50%; animation:spin 1s linear infinite; display:inline-block;
}

.footer { text-align:center; margin-top:36px; font-size:11px; color: var(--text-secondary); font-family:'DM Mono',monospace; letter-spacing:0.06em; }
</style>