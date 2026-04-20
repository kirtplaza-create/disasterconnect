<template>
  <div class="fade-up">
    <!-- Hero -->
    <div class="hero">
      <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:#00E5A006;pointer-events:none;"></div>
      <div class="hero-icon float"><Heart :size="48" color="#00E5A0" fill="#00E5A0" /></div>
      <div class="hero-title">Every Donation Saves Lives</div>
      <div class="hero-sub">Your generosity directly reaches affected families in Davao Region. Track exactly where your donations go — from your hands to their hands.</div>
      <div class="hero-btns">
        <button class="btn-primary" @click="$emit('navigate','donor-donate')"><HeartHandshake :size="18" /> Donate Now</button>
        <button class="btn-outline" @click="$emit('navigate','donor-disasters')"><CloudLightning :size="18" /> See Active Disasters</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-icon"><CloudLightning :size="20" color="#FF3B5C" /></div><div class="stat-val" style="color:#FF3B5C;">{{ activeDisasters }}</div><div class="stat-label">ACTIVE DISASTERS</div></div>
      <div class="stat-box"><div class="stat-icon"><Users :size="20" color="#FF6B35" /></div><div class="stat-val" style="color:#FF6B35;">{{ totalFamilies.toLocaleString() }}</div><div class="stat-label">FAMILIES IN NEED</div></div>
      <div class="stat-box"><div class="stat-icon"><Package :size="20" color="#00E5A0" /></div><div class="stat-val" style="color:#00E5A0;">{{ totalItemsDonated.toLocaleString() }}</div><div class="stat-label">TOTAL ITEMS DONATED</div></div>
      <div class="stat-box"><div class="stat-icon"><CheckCircle :size="20" color="#00E5A0" /></div><div class="stat-val" style="color:#00E5A0;">{{ confirmed }}</div><div class="stat-label">DONATIONS CONFIRMED</div></div>
    </div>

    <!-- Urgent needs -->
    <div style="margin-bottom:24px;">
      <div class="section-title"><AlertTriangle :size="18" color="#FF3B5C" /> Urgent Needs Right Now</div>
      <div class="urgent-grid">
        <div v-for="r in urgentReports" :key="r.id" class="urgent-card" :style="{ borderLeft:`3px solid ${sevColor(r.severity)}` }" @click="$emit('navigate','donor-donate')">
          <div class="urgent-header">
            <div>
              <div class="urgent-brgy">{{ r.brgy }}</div>
              <div class="urgent-muni">{{ r.muni }}</div>
            </div>
            <span class="badge" :style="badgeStyle(sevColor(r.severity))">{{ r.severity }}</span>
          </div>
          <span class="badge" :style="badgeStyle('#00D4FF')">{{ r.dtype }}</span>
          <div class="urgent-desc">{{ r.desc.slice(0,80) }}...</div>
          <div style="height:1px;background:#1A2535;margin:10px 0;"></div>
          <div class="urgent-needs">
            <span><Box :size="12" /> Needs: <span style="color:#FF6B35;font-weight:700;">{{ r.foodNeeded }} packs</span></span>
            <span><Droplet :size="12" /> <span style="color:#00D4FF;font-weight:700;">{{ r.waterNeeded }}L</span></span>
          </div>
          <div class="urgent-cta">Donate for this barangay <ArrowRight :size="12" style="display:inline;" /></div>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="card">
      <div class="section-title" style="color:#00E5A0;"><Search :size="18" /> How Your Donation is Tracked</div>
      <div class="how-grid">
        <div v-for="s in howSteps" :key="s.step" class="how-step">
          <div class="how-icon"><component :is="s.icon" :size="32" :color="s.color" /></div>
          <div class="how-title">{{ s.title }}</div>
          <div class="how-desc">{{ s.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Heart, 
  HeartHandshake, 
  CloudLightning, 
  Users, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Box, 
  Droplet, 
  ArrowRight, 
  Search,
  Truck,
  Home
} from 'lucide-vue-next'
const props = defineProps({ reports: Array, donations: Array })
defineEmits(['navigate'])

const activeDisasters   = computed(() => props.reports.filter(r => r.status !== 'distributed').length)
const totalFamilies     = computed(() => props.reports.reduce((s,r) => s+r.families, 0))
const totalItemsDonated = computed(() => props.donations.reduce((s,d) => s+(d.items||[]).reduce((ss,i)=>ss+i.qty,0), 0))
const confirmed         = computed(() => props.donations.filter(d => d.status==='received').length)
const urgentReports     = computed(() => props.reports.filter(r => r.severity==='Critical'||r.severity==='High'))

const sevColor   = s => ({ Critical:'#FF3B5C', High:'#FF6B35', Moderate:'#FFD23F', Low:'#00E5A0' })[s]||'#4A6080'
const badgeStyle = c => ({ background:c+'18', border:`1px solid ${c}44`, color:c })

const howSteps = [
  { step:'1', icon: HeartHandshake, color: '#FF3B5C', title:'You Donate',    desc:'Log your donation with items and quantity' },
  { step:'2', icon: CheckCircle,    color: '#00D4FF', title:'LGU Verifies',  desc:'Operations center confirms your donation' },
  { step:'3', icon: Truck,          color: '#FFD23F', title:'Dispatched',    desc:'Relief goods are packed and sent to barangay' },
  { step:'4', icon: Home,           color: '#00E5A0', title:'Received',      desc:'Barangay captain signs for delivery' },
]
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.fade-up{animation:fadeUp .4s ease forwards}
.float{animation:float 3s ease-in-out infinite;display:inline-block}

.hero{background:linear-gradient(135deg,#00E5A012,#00D4FF06);border:1px solid #00E5A033;border-radius:12px;padding:2.5rem 2rem;margin-bottom:24px;text-align:center;position:relative;overflow:hidden}
.hero-icon{font-size:48px;margin-bottom:12px}
.hero-title{font-size:26px;font-weight:900;margin-bottom:8px}
.hero-sub{font-size:14px;color:#4A6080;max-width:520px;margin:0 auto 20px;line-height:1.8}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat-box{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.2rem;position:relative;overflow:hidden}
.stat-icon{font-size:20px;margin-bottom:8px}
.stat-val{font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1}
.stat-label{font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}

.section-title{font-size:16px;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.urgent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.urgent-card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem;cursor:pointer;transition:all .2s}
.urgent-card:hover{transform:translateY(-2px);border-color:#00E5A033}
.urgent-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.urgent-brgy{font-size:13px;font-weight:800}
.urgent-muni{font-size:11px;color:#4A6080}
.urgent-desc{font-size:12px;color:#4A6080;margin-top:8px;line-height:1.6}
.urgent-needs{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:#4A6080}
.urgent-cta{font-size:11px;color:#00E5A0;margin-top:8px;font-weight:700}

.card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem}
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.how-step{text-align:center;padding:1rem}
.how-icon{font-size:28px;margin-bottom:8px}
.how-title{font-size:12px;font-weight:700;margin-bottom:4px}
.how-desc{font-size:11px;color:#4A6080;line-height:1.6}

.btn-primary{background:#00E5A0;color:#060A0F;border:none;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-outline{background:transparent;border:1px solid #00E5A0;color:#00E5A0;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s}
.btn-outline:hover{background:#00E5A018}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
</style>
