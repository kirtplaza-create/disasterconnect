<template>
  <!-- TOP BAR — shown after login on every portal -->
  <header class="topbar" :style="{ borderBottomColor: `color-mix(in srgb, ${portalColor}, transparent 73%)` }">

    <!-- LEFT: Logo + portal name -->
    <div class="topbar-left">
      <div class="topbar-logo" :style="{ background: `color-mix(in srgb, ${portalColor}, transparent 91%)`, border: `1px solid color-mix(in srgb, ${portalColor}, transparent 73%)` }">
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

      <!-- Theme toggle -->
      <button class="theme-toggle-btn" @click="toggleTheme" :title="isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
        <Sun v-if="isLightMode" :size="16" />
        <Moon v-else :size="16" />
      </button>

      <!-- Logout button -->
      <button class="logout-btn" @click="$emit('logout')" title="Logout">
        <LogOut :size="14" />
      </button>
    </div>
  </header>
</template>


<script setup>
import { computed, inject } from 'vue'
import { Landmark, Home, HeartHandshake, Zap, LogOut, Sun, Moon } from 'lucide-vue-next'

const isLightMode = inject('isLightMode')
const toggleTheme = inject('toggleTheme')

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
  lgu:      { color: 'var(--color-accent)', icon: Landmark,       label: 'LGU PORTAL' },
  barangay: { color: 'var(--color-warn)', icon: Home,           label: 'BARANGAY PORTAL' },
  donor:    { color: 'var(--color-success)', icon: HeartHandshake, label: 'DONOR PORTAL' },
}

// These computed values read from PORTAL_CONFIG based on the current portal prop
const portalColor = computed(() => PORTAL_CONFIG[props.portal]?.color || 'var(--color-accent)')
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
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  transition: all 0.3s;
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
  color: var(--text-secondary);
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
.topbar-usersub { font-size: 10px; color: var(--text-secondary); }

/* THEME TOGGLE */
.theme-toggle-btn {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}
.theme-toggle-btn:hover {
  background: var(--bg-body);
  color: var(--text-primary);
  transform: translateY(-1px);
}

/* LOGOUT BUTTON */
.logout-btn {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: color-mix(in srgb, var(--color-danger), transparent 91%);
  border-color: color-mix(in srgb, var(--color-danger), transparent 73%);
  color: var(--color-danger);
}
</style>
