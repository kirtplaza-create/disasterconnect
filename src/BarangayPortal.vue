<template>
  <div style="min-height:100vh;background:#060A0F;">
    <div class="topbar">
      <div class="logo">
        <div class="logo-icon"><Home :size="16" color="#FFD23F" fill="#FFD23F33" /></div>
        <div>
          <div class="logo-name">DisasterConnect</div>
          <div class="logo-sub">BARANGAY PORTAL</div>
        </div>
      </div>
      <nav class="nav">
        <button v-for="p in PAGES" :key="p.id" class="nav-btn"
          :style="{ background: currentPage===p.id ? '#FFD23F18':'transparent', borderBottomColor: currentPage===p.id ? '#FFD23F':'transparent', color: currentPage===p.id ? '#FFD23F':'#4A6080', fontWeight: currentPage===p.id ? 700:400 }"
          @click="currentPage = p.id">
          <component :is="p.icon" :size="14" style="margin-right: 6px;" />
          {{ p.label }}
        </button>
      </nav>
      <div class="user-area">
        <div style="text-align:right;">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-sub">{{ user.subtitle }}</div>
        </div>
        <button class="logout-btn" @click="$emit('logout')">Logout</button>
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
  Home, 
  LayoutDashboard, 
  Users, 
  Folder, 
  Truck, 
  ClipboardPlus 
} from 'lucide-vue-next'
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
.topbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0D1219;border-bottom:1px solid #1A2535;display:flex;align-items:center;height:56px;padding:0 1.5rem;gap:0}
.logo{display:flex;align-items:center;gap:10px;margin-right:32px;flex-shrink:0}
.logo-icon{width:28px;height:28px;border-radius:8px;background:#FFD23F18;border:1px solid #FFD23F33;display:flex;align-items:center;justify-content:center;font-size:14px}
.logo-name{font-size:13px;font-weight:800;color:#FFD23F;line-height:1}
.logo-sub{font-size:9px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.08em}
.nav{display:flex;flex:1;gap:2px}
.nav-btn{padding:6px 14px;border:none;border-bottom:2px solid transparent;font-size:12px;transition:all .15s;border-radius:0;cursor:pointer;font-family:'Outfit',sans-serif;background:transparent}
.user-area{display:flex;align-items:center;gap:10px;flex-shrink:0}
.user-name{font-size:12px;font-weight:700;color:#FFD23F}
.user-sub{font-size:10px;color:#4A6080}
.logout-btn{background:#1A2535;border:none;color:#4A6080;padding:5px 12px;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif}
.logout-btn:hover{color:#E2EAF4}
.main{margin-top:56px;padding:2rem 2.5rem;min-height:100vh}
</style>