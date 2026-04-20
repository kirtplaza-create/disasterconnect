<template>
  <div style="min-height:100vh;background:#060A0F;">
    <!-- Top Bar -->
    <div class="topbar">
      <div class="logo">
        <div class="logo-icon"><HeartHandshake :size="16" color="#00E5A0" fill="#00E5A033" /></div>
        <div>
          <div class="logo-name">DisasterConnect</div>
          <div class="logo-sub">DONOR PORTAL</div>
        </div>
      </div>

      <nav class="nav">
        <button v-for="p in PAGES" :key="p.id" class="nav-btn"
          :style="{ background: currentPage===p.id ? '#00E5A018':'transparent', borderBottomColor: currentPage===p.id ? '#00E5A0':'transparent', color: currentPage===p.id ? '#00E5A0':'#4A6080', fontWeight: currentPage===p.id ? 700:400 }"
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
  HeartHandshake, 
  Home, 
  CloudLightning, 
  Heart, 
  Package, 
  BarChart3 
} from 'lucide-vue-next'
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
.topbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0D1219;border-bottom:1px solid #1A2535;display:flex;align-items:center;height:56px;padding:0 1.5rem;gap:0}
.logo{display:flex;align-items:center;gap:10px;margin-right:32px;flex-shrink:0}
.logo-icon{width:28px;height:28px;border-radius:8px;background:#00E5A018;border:1px solid #00E5A033;display:flex;align-items:center;justify-content:center;font-size:14px}
.logo-name{font-size:13px;font-weight:800;color:#00E5A0;line-height:1}
.logo-sub{font-size:9px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.08em}
.nav{display:flex;flex:1;gap:2px}
.nav-btn{padding:6px 14px;border:none;border-bottom:2px solid transparent;font-size:12px;transition:all .15s;border-radius:0;cursor:pointer;font-family:'Outfit',sans-serif;background:transparent}
.user-area{display:flex;align-items:center;gap:10px;flex-shrink:0}
.user-name{font-size:12px;font-weight:700;color:#00E5A0}
.user-sub{font-size:10px;color:#4A6080}
.logout-btn{background:#1A2535;border:none;color:#4A6080;padding:5px 12px;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Outfit',sans-serif}
.logout-btn:hover{color:#E2EAF4}
.main{margin-top:56px;padding:2rem 2.5rem;min-height:100vh}
</style>
