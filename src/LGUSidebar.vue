<template>
  <!-- SIDEBAR — fixed left panel, always visible inside the LGU portal -->
  <aside class="sidebar">

    <!-- ── LOGO ── -->
    <div class="sidebar-logo">
      <div class="logo-icon"><Zap :size="16" color="#00D4FF" fill="#00D4FF33" /></div>
      <div>
        <div class="logo-name">DisasterConnect</div>
        <div class="logo-sub">LGU COMMAND SYSTEM</div>
      </div>
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
      <div class="footer-avatar"><Landmark :size="16" color="#00D4FF" /></div>
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
  Landmark
} from 'lucide-vue-next'
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
  background: #0D1219;
  border-right: 1px solid #1A2535;
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
  gap: 10px;
  padding: 1.25rem;
  border-bottom: 1px solid #1A2535;
}
.logo-icon {
  width: 32px; height: 32px;
  background: #00D4FF15;
  border: 1px solid #00D4FF33;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.logo-name {
  font-size: 13px;
  font-weight: 900;
  color: #00D4FF;
  line-height: 1;
  margin-bottom: 2px;
}
.logo-sub {
  font-size: 9px;
  color: #4A6080;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.07em;
}

/* ── LIVE STATUS ── */
.sidebar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid #1A2535;
}
.pulse-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00E5A0;
  animation: pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
.status-text {
  font-size: 10px;
  color: #00E5A0;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.07em;
  flex: 1;
}
.alert-badge {
  background: #FF3B5C;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: 'DM Mono', monospace;
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
  color: #4A6080;
  font-size: 13px;
}
.nav-item:hover {
  background: #00D4FF08;
  color: #E2EAF4;
  border-left-color: #00D4FF44;
}
.nav-item.active {
  background: #00D4FF10;
  color: #E2EAF4;
  border-left-color: #00D4FF;
  font-weight: 600;
}
.nav-icon  { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }
.nav-label { flex: 1; }
.ai-badge  {
  font-size: 9px;
  background: #00D4FF18;
  border: 1px solid #00D4FF44;
  color: #00D4FF;
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
  border-top: 1px solid #1A2535;
}
.footer-avatar {
  width: 32px; height: 32px;
  background: #00D4FF12;
  border: 1px solid #00D4FF33;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.footer-info  { flex: 1; overflow: hidden; }
.footer-name  { font-size: 12px; font-weight: 700; color: #E2EAF4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.footer-sub   { font-size: 10px; color: #4A6080; }
.footer-logout {
  background: transparent;
  border: 1px solid #1A2535;
  color: #4A6080;
  width: 24px; height: 24px;
  border-radius: 4px;
  font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.footer-logout:hover {
  background: #FF3B5C18;
  border-color: #FF3B5C44;
  color: #FF3B5C;
}
</style>