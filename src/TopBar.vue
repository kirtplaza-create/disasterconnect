<template>
  <!-- TOP BAR — shown after login on every portal -->
  <header class="topbar" :style="{ borderBottomColor: portalColor + '44' }">

    <!-- LEFT: Logo + portal name -->
    <div class="topbar-left">
      <div class="topbar-logo" :style="{ background: portalColor + '15', border: `1px solid ${portalColor}33` }">
        <component :is="portalIcon" :size="16" :color="portalColor" />
      </div>
      <div>
        <div class="topbar-appname" :style="{ color: portalColor }">DisasterConnect</div>
        <div class="topbar-portal">{{ portalLabel }}</div>
      </div>
    </div>

    <!-- RIGHT: User info + logout -->
    <div class="topbar-right">
      <!-- Live indicator -->
      <div class="live-pill">
        <div class="pulse-dot" :style="{ background: portalColor }" />
        <span :style="{ color: portalColor }">LIVE</span>
      </div>

      <!-- User name -->
      <div class="topbar-user">
        <div class="topbar-username" :style="{ color: portalColor }">{{ user.name }}</div>
        <div class="topbar-usersub">{{ user.subtitle }}</div>
      </div>

      <!-- Logout button -->
      <button class="logout-btn" @click="$emit('logout')" title="Logout">
        <LogOut :size="14" />
      </button>
    </div>
  </header>
</template>


<script setup>
import { computed } from 'vue'
import { Landmark, Home, HeartHandshake, Zap, LogOut } from 'lucide-vue-next'

// ─── PROPS ────────────────────────────────────────────────────────────────────
// Props are values passed in from the parent (App.vue)
const props = defineProps({
  user:   { type: Object,  required: true },   // the logged-in user object
  portal: { type: String,  required: true },   // 'lgu' | 'barangay' | 'donor'
})

// ─── EMITS ────────────────────────────────────────────────────────────────────
// We tell Vue that this component can emit a 'logout' event
// The parent (App.vue) listens for this with @logout="handleLogout"
defineEmits(['logout'])

// ─── PORTAL CONFIG ────────────────────────────────────────────────────────────
// Maps each portal name to its color, icon, and label
const PORTAL_CONFIG = {
  lgu:      { color: '#00D4FF', icon: Landmark,       label: 'LGU PORTAL' },
  barangay: { color: '#FFD23F', icon: Home,           label: 'BARANGAY PORTAL' },
  donor:    { color: '#00E5A0', icon: HeartHandshake, label: 'DONOR PORTAL' },
}

// These computed values read from PORTAL_CONFIG based on the current portal prop
const portalColor = computed(() => PORTAL_CONFIG[props.portal]?.color || '#00D4FF')
const portalIcon  = computed(() => PORTAL_CONFIG[props.portal]?.icon  || Zap)
const portalLabel = computed(() => PORTAL_CONFIG[props.portal]?.label || 'PORTAL')
</script>


<style scoped>
/* ── TOP BAR ── */
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 56px;
  background: #0D1219;
  border-bottom: 1px solid #1A2535;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  transition: border-bottom-color 0.3s;
}

/* LEFT SIDE */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-logo {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.topbar-appname {
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 1px;
}
.topbar-portal {
  font-size: 9px;
  color: #4A6080;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.1em;
}

/* RIGHT SIDE */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.live-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
}
.pulse-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.topbar-user    { text-align: right; }
.topbar-username{ font-size: 13px; font-weight: 700; line-height: 1; margin-bottom: 1px; }
.topbar-usersub { font-size: 10px; color: #4A6080; }

/* LOGOUT BUTTON */
.logout-btn {
  background: #1A2535;
  border: 1px solid #1A2535;
  color: #4A6080;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: #FF3B5C18;
  border-color: #FF3B5C44;
  color: #FF3B5C;
}
</style>
