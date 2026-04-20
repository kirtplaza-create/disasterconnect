<template>
  <!-- SIDEBAR — fixed left panel, always visible inside the LGU portal -->
  <aside class="sidebar">

    <!-- ── LOGO ── -->
    <div class="sidebar-logo">
      <div class="logo-icon"><Zap :size="16" color="var(--color-accent)" :fill="`color-mix(in srgb, var(--color-accent), transparent 80%)`" /></div>
      <div style="flex: 1">
        <div class="logo-name">DisasterConnect</div>
        <div class="logo-sub">LGU COMMAND SYSTEM</div>
      </div>
      <button class="theme-toggle" @click="toggleTheme" :title="isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
        <Sun v-if="isLightMode" :size="14" />
        <Moon v-else :size="14" />
      </button>
    </div>

    <!-- ── LIVE STATUS ── -->
    <div class="sidebar-status">
      <div class="pulse-dot" />
      <span class="status-text">SYSTEM ACTIVE</span>
      <!-- Alert badge — shows how many critical/high reports exist -->
      <span v-if="alerts > 0" class="alert-badge">{{ alerts }}</span>
    </div>

    <!-- ── NAVIGATION ── -->
    <nav class="sidebar-nav">
      <div
        v-for="item in NAV_ITEMS"
        :key="item.id"
        class="nav-item"
        :class="{ active: currentPage === item.id }"
        @click="$emit('navigate', item.id)"
      >
        <span class="nav-icon"><component :is="item.icon" :size="16" /></span>
        <span class="nav-label">{{ item.label }}</span>
        <!-- AI badge for AI-powered pages -->
        <span v-if="item.ai" class="ai-badge">AI</span>
      </div>
    </nav>

    <!-- ── BOTTOM: logged-in user info ── -->
    <div class="sidebar-footer">
      <div class="footer-avatar"><Landmark :size="16" color="var(--color-accent)" /></div>
      <div class="footer-info">
        <div class="footer-name">{{ user.name }}</div>
        <div class="footer-sub">{{ user.subtitle }}</div>
      </div>
      <button class="footer-logout" @click="$emit('logout')" title="Logout">
        <LogOut :size="14" />
      </button>
    </div>
  </aside>
</template>


<script setup>
import { 
  Zap, 
  LayoutDashboard, 
  FileText, 
  Brain, 
  ClipboardCheck, 
  Boxes, 
  Package, 
  HeartHandshake, 
  Truck, 
  BarChart3, 
  Bot, 
  LogOut,
  Landmark,
  Sun,
  Moon
} from 'lucide-vue-next'
import { inject } from 'vue'

const isLightMode = inject('isLightMode')
const toggleTheme = inject('toggleTheme')
// ─── PROPS ────────────────────────────────────────────────────────────────────
defineProps({
  currentPage: { type: String,  required: true },  // which page is active
  alerts:      { type: Number,  default: 0 },       // number of critical alerts
  user:        { type: Object,  required: true },   // logged-in user
})

// ─── EMITS ────────────────────────────────────────────────────────────────────
defineEmits(['navigate', 'logout'])

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
// Each item has an id (matches page names), icon, label, and optional ai flag
const NAV_ITEMS = [
  { id: 'dashboard',  icon: LayoutDashboard,  label: 'Dashboard' },
  { id: 'reports',    icon: FileText,         label: 'Disaster Reports' },
  { id: 'analysis',   icon: Brain,            label: 'AI Disaster Analysis', ai: true },
  { id: 'needs',      icon: ClipboardCheck,   label: 'Needs Assessment',      ai: true },
  { id: 'matching',   icon: Boxes,            label: 'Resource Matching',     ai: true },
  { id: 'inventory',  icon: Package,          label: 'Inventory' },
  { id: 'donations',  icon: HeartHandshake,   label: 'Donations' },
  { id: 'deliveries', icon: Truck,            label: 'Deliveries' },
  { id: 'bi',         icon: BarChart3,        label: 'BI Analytics' },
  { id: 'assistant',  icon: Bot,              label: 'AI Command Center',     ai: true },
]
</script>


<style scoped>
/* ── SIDEBAR SHELL ── */
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  z-index: 50;
}

/* ── LOGO ── */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}
.logo-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent), transparent 85%), color-mix(in srgb, var(--color-accent), transparent 95%));
  border: 1px solid color-mix(in srgb, var(--color-accent), transparent 70%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-accent), transparent 90%);
  transition: all 0.3s ease;
}
.sidebar-logo:hover .logo-icon {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--color-accent), transparent 80%);
  border-color: var(--color-accent);
}
.logo-name {
  font-size: 15px;
  font-weight: 900;
  background: linear-gradient(to right, var(--color-accent), color-mix(in srgb, var(--color-accent), white 30%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 3px;
  letter-spacing: -0.01em;
}
.logo-sub {
  font-size: 9px;
  color: var(--text-secondary);
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.1em;
  font-weight: 600;
  opacity: 0.8;
}
.theme-toggle {
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
}
.theme-toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-dim);
  transform: rotate(15deg) scale(1.1);
}
.theme-toggle:active {
  transform: scale(0.95);
}

/* ── LIVE STATUS ── */
.sidebar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}
.pulse-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
  animation: pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--color-success); }
  50%       { opacity: 0.4; box-shadow: 0 0 2px var(--color-success); }
}
.status-text {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-success);
  font-family: var(--font-mono);
  letter-spacing: 0.07em;
  flex: 1;
}
.alert-badge {
  background: linear-gradient(135deg, var(--color-danger), color-mix(in srgb, var(--color-danger), black 15%));
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 12px;
  font-family: var(--font-mono);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-danger), transparent 50%);
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* ── NAV ── */
.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 1.25rem;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  color: var(--text-secondary);
  font-size: 13px;
}
.nav-item:hover {
  background: var(--accent-glow);
  color: var(--text-primary);
  border-left-color: var(--color-accent-border);
}
.nav-item.active {
  background: var(--accent-glow);
  color: var(--text-primary);
  border-left-color: var(--color-accent);
  font-weight: 600;
}
.nav-icon  { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }
.nav-label { flex: 1; }
.ai-badge  {
  font-size: 9px;
  border: 1px solid color-mix(in srgb, var(--color-accent), transparent 73%);
  color: var(--color-accent);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.05em;
}

/* ── FOOTER ── */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
}
.footer-avatar {
  width: 32px; height: 32px;
  background: color-mix(in srgb, var(--color-accent), transparent 93%);
  border: 1px solid color-mix(in srgb, var(--color-accent), transparent 73%);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.footer-info  { flex: 1; overflow: hidden; }
.footer-name  { font-size: 12px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.footer-sub   { font-size: 10px; color: var(--text-secondary); }
.footer-logout {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 24px; height: 24px;
  border-radius: 4px;
  font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.footer-logout:hover {
  background: color-mix(in srgb, var(--color-danger), transparent 91%);
  border-color: color-mix(in srgb, var(--color-danger), transparent 73%);
  color: var(--color-danger);
}
</style>