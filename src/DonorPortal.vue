<template>
  <div style="min-height:100vh;background: var(--bg-body); transition: background 0.3s;">
    <!-- Top Bar -->
    <div class="topbar">
      <div class="logo">
        <div class="logo-icon"><HeartHandshake :size="16" color="var(--color-success)" fill="var(--color-success)33" /></div>
        <div>
          <div class="logo-name">DisasterConnect</div>
          <div class="logo-sub">DONOR PORTAL</div>
        </div>
      </div>

      <nav class="nav">
        <button v-for="p in PAGES" :key="p.id" class="nav-btn"
          :style="{ background: currentPage===p.id ? 'var(--color-success)18':'transparent', borderBottomColor: currentPage===p.id ? 'var(--color-success)':'transparent', color: currentPage===p.id ? 'var(--color-success)':'var(--text-secondary)', fontWeight: currentPage===p.id ? 700:400 }"
          @click="currentPage = p.id">
          <component :is="p.icon" :size="14" style="margin-right: 6px;" />
          {{ p.label }}
        </button>
      </nav>

      <div class="user-area">
        <button class="theme-toggle" @click="toggleTheme" :title="isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
          <Sun v-if="isLightMode" :size="14" />
          <Moon v-else :size="14" />
        </button>
        <div style="text-align:right;">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-sub">{{ user.subtitle }}</div>
        </div>
        <button class="logout-btn" @click="$emit('logout')">Logout</button>
      </div>
    </div>

    <main class="main">
      <DonorHome      v-if="currentPage==='donor-home'"      :reports="reports"   :donations="donations"  @navigate="currentPage = $event" />
      <DonorDisasters v-else-if="currentPage==='donor-disasters'" :reports="reports" @navigate="currentPage = $event" @set-report="donateForReport = $event" />
      <DonorDonate    v-else-if="currentPage==='donor-donate'"    :reports="reports" :donations="donations" :donate-for-report="donateForReport" @navigate="currentPage=$event" />
      <DonorTrack     v-else-if="currentPage==='donor-track'"     :donations="donations" />
      <DonorImpact    v-else-if="currentPage==='donor-impact'"    :reports="reports" :donations="donations" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Heart, 
  Package, 
  BarChart3,
  Sun,
  Moon,
  HeartHandshake,
  Home,
  CloudLightning
} from 'lucide-vue-next'
import { inject } from 'vue'

const isLightMode = inject('isLightMode')
const toggleTheme = inject('toggleTheme')
import DonorHome      from './donor/DonorHome.vue'
import DonorDisasters from './donor/DonorDisasters.vue'
import DonorDonate    from './donor/DonorDonate.vue'
import DonorTrack     from './donor/DonorTrack.vue'
import DonorImpact    from './donor/DonorImpact.vue'

defineProps({
  user:      { type: Object, required: true },
  reports:   { type: Array,  required: true },
  donations: { type: Array,  required: true },
})
defineEmits(['logout'])

const currentPage    = ref('donor-home')
const donateForReport = ref(null)

const PAGES = [
  { id:'donor-home',      label:'Home',            icon: Home },
  { id:'donor-disasters', label:'Active Disasters', icon: CloudLightning },
  { id:'donor-donate',    label:'Make a Donation',  icon: Heart },
  { id:'donor-track',     label:'My Donations',     icon: Package },
  { id:'donor-impact',    label:'Impact Board',     icon: BarChart3 },
]
</script>

<style scoped>
.topbar{position:fixed;top:0;left:0;right:0;z-index:100;background: var(--bg-surface);border-bottom:1px solid var(--border-color);display:flex;align-items:center;height:56px;padding:0 1.5rem;gap:0; transition: all 0.3s;}
.logo{display:flex;align-items:center;gap:10px;margin-right:32px;flex-shrink:0}
.logo-icon{width:28px;height:28px;border-radius:8px;background:var(--color-success)18;border:1px solid var(--color-success)33;display:flex;align-items:center;justify-content:center;font-size:14px}
.logo-name{font-size:13px;font-weight:800;color:var(--color-success);line-height:1}
.logo-sub{font-size:9px;color: var(--text-secondary);font-family:'DM Mono',monospace;letter-spacing:.08em}
.nav{display:flex;flex:1;gap:2px}
.nav-btn{padding:6px 14px;border:none;border-bottom:2px solid transparent;font-size:12px;transition:all .15s;border-radius:0;cursor:pointer;font-family:'Outfit',sans-serif;background:transparent}
.user-area{display:flex;align-items:center;gap:10px;flex-shrink:0}
.user-name{font-size:12px;font-weight:700;color:var(--color-success)}
.user-sub{font-size:10px;color: var(--text-secondary)}
.theme-toggle {
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
}
.theme-toggle:hover {
  border-color: var(--color-success);
  color: var(--color-success);
  background: var(--color-success-dim);
}
.logout-btn{background: var(--border-color);border:none;color: var(--text-secondary);padding:5px 12px;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif; transition: all 0.2s;}
.logout-btn:hover{background: var(--bg-body); color: var(--text-primary)}
.main{margin-top:56px;padding:2rem 2.5rem;min-height:100vh}
</style>
