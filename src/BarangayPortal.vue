<template>
  <div style="min-height:100vh;background: var(--bg-body); transition: background 0.3s;">
    <div class="topbar">
      <div class="logo">
        <div class="logo-icon"><Home :size="18" /></div>
        <div>
          <div class="logo-name">DisasterConnect</div>
          <div class="logo-sub">BARANGAY PORTAL</div>
        </div>
      </div>
      
      <nav class="nav">
        <button v-for="p in PAGES" :key="p.id" 
          class="nav-btn"
          :class="{ active: currentPage === p.id }"
          @click="currentPage = p.id">
          <component :is="p.icon" :size="16" class="nav-icon" />
          <span>{{ p.label }}</span>
        </button>
      </nav>

      <div class="user-area">
        <button class="theme-toggle" @click="toggleTheme" :title="isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
          <Sun v-if="isLightMode" :size="16" />
          <Moon v-else :size="16" />
        </button>
        
        <div class="profile-chip">
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-sub">{{ user.subtitle }}</div>
          </div>
          <button class="logout-btn" @click="$emit('logout')">Logout</button>
        </div>
      </div>
    </div>

    <main class="main">
      <BrgyDashboard
        v-if="currentPage==='brgy-dashboard'"
        :residents="residents"
        :reports="reports"
        :deliveries="deliveries"
        @navigate="currentPage = 'brgy-' + $event"
        @add-family="openAddFamily"
      />
      <BrgySubmitReport
        v-else-if="currentPage==='brgy-submit'"
        :user="user"
        :residents="residents"
        :reports="reports"
        @navigate="currentPage = 'brgy-' + $event"
      />
      <BrgyReports
        v-else-if="currentPage==='brgy-reports'"
        :reports="filteredReports"
      />
      <BrgyDeliveries
        v-else-if="currentPage==='brgy-deliveries'"
        :deliveries="deliveries"
      />
      <BrgyResidents
        v-else-if="currentPage==='brgy-residents'"
        :residents="residents"
        :trigger-add="triggerAdd"
        @update:trigger-add="triggerAdd = $event"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { 
  Truck, 
  ClipboardPlus,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  Folder,
  Home
} from 'lucide-vue-next'
import { inject } from 'vue'

const isLightMode = inject('isLightMode')
const toggleTheme = inject('toggleTheme')
import BrgyDashboard    from './brgy/BrgyDashboard.vue'
import BrgySubmitReport from './brgy/BrgySubmitReport.vue'
import BrgyReports      from './brgy/BrgyReports.vue'
import BrgyDeliveries   from './brgy/BrgyDeliveries.vue'
import BrgyResidents    from './brgy/BrgyResidents.vue'

const props = defineProps({
  user:       { type: Object, required: true },
  residents:  { type: Array,  default: () => [] },
  reports:    { type: Array,  default: () => [] },
  deliveries: { type: Array,  default: () => [] },
})
const emit = defineEmits(['logout'])

const triggerAdd  = ref(false)
const currentPage = ref('brgy-dashboard')

// Filter reports to only show those belonging to this barangay
const filteredReports = computed(() => {
  return props.reports.filter(r => r.brgy === props.user.name)
})

const openAddFamily = () => {
  currentPage.value = 'brgy-residents'
  triggerAdd.value  = true
}

const PAGES = [
  { id:'brgy-dashboard',  label:'Dashboard',    icon: LayoutDashboard },
  { id:'brgy-residents',  label:'Resident List', icon: Users },
  { id:'brgy-reports',    label:'My Reports',    icon: Folder },
  { id:'brgy-deliveries', label:'Relief Status', icon: Truck },
  { id:'brgy-submit',     label:'Submit Report', icon: ClipboardPlus },
]
</script>

<style scoped>
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: color-mix(in srgb, var(--bg-surface), transparent 15%);
  backdrop-filter: blur(16px) saturate(160%); -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; height: 72px; padding: 0 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo { display: flex; align-items: center; gap: 14px; margin-right: 48px; flex-shrink: 0; cursor: pointer; }
.logo-icon { 
  width: 36px; height: 36px; border-radius: 12px; 
  background: linear-gradient(135deg, var(--color-warn), #ff8c00); 
  display: flex; align-items: center; justify-content: center; color: var(--bg-body);
  box-shadow: 0 4px 15px color-mix(in srgb, var(--color-warn), transparent 60%);
  transition: transform 0.2s ease;
}
.logo:hover .logo-icon { transform: scale(1.05) rotate(-3deg); }
.logo-name { font-size: 16px; font-weight: 900; color: var(--text-primary); line-height: 1; letter-spacing: -0.03em; }
.logo-sub { font-size: 9px; color: var(--color-warn); font-family: 'DM Mono', monospace; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 3px; font-weight: 700; opacity: 0.9; }

.nav { display: flex; flex: 1; gap: 6px; align-items: center; }
.nav-btn { 
  padding: 10px 18px; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; font-family: 'Outfit', sans-serif;
  background: transparent; color: var(--text-secondary); display: flex; align-items: center;
}
.nav-icon { margin-right: 10px; opacity: 0.6; transition: all 0.2s; }
.nav-btn:hover { background: color-mix(in srgb, var(--text-primary), transparent 95%); color: var(--text-primary); }
.nav-btn:hover .nav-icon { opacity: 1; transform: translateY(-1px); }
.nav-btn.active { background: color-mix(in srgb, var(--color-warn), transparent 90%); color: var(--color-warn); box-shadow: 0 4px 12px color-mix(in srgb, var(--color-warn), transparent 96%); }
.nav-btn.active .nav-icon { opacity: 1; color: var(--color-warn); }

.user-area { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }

.theme-toggle {
  background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-secondary);
  width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.theme-toggle:hover { border-color: var(--color-warn); color: var(--color-warn); transform: translateY(-1px); box-shadow: 0 4px 12px color-mix(in srgb, var(--color-warn), transparent 90%); }

.profile-chip {
  display: flex; align-items: center; gap: 16px; padding: 5px 5px 5px 16px;
  background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.user-info { text-align: right; }
.user-name { font-size: 12.5px; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
.user-sub { font-size: 10px; color: var(--text-secondary); font-family: 'DM Mono', monospace; opacity: 0.8; }

.logout-btn { 
  background: var(--color-warn); color: var(--bg-body); border: none; border-radius: 30px;
  padding: 8px 18px; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.2s;
  font-family: 'Outfit', sans-serif; box-shadow: 0 4px 12px color-mix(in srgb, var(--color-warn), transparent 70%);
}
.logout-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 15px color-mix(in srgb, var(--color-warn), transparent 60%); }

.main { margin-top: 72px; padding: 2.5rem; min-height: calc(100vh - 72px); }

@media (max-width: 1024px) {
  .logo-name { display: none; }
  .logo-sub { display: none; }
  .nav-btn span { display: none; }
  .nav-btn { padding: 10px; }
  .nav-icon { margin-right: 0; }
}
</style>