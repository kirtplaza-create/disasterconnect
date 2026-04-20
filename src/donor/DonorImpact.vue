<template>
  <div class="fade-up">
    <div style="margin-bottom:20px;">
      <div class="portal-label">DONOR PORTAL</div>
      <h1 class="page-title">Impact Board</h1>
      <p class="page-sub">See how collective donations are making a real difference</p>
    </div>

    <div class="stat-grid">
      <div class="stat-box"><div class="stat-icon"><HeartHandshake :size="20" color="#00E5A0" /></div><div class="stat-val" style="color:#00E5A0;">{{ donations.length }}</div><div class="stat-label">TOTAL DONATIONS</div></div>
      <div class="stat-box"><div class="stat-icon"><Package :size="20" color="#00D4FF" /></div><div class="stat-val" style="color:#00D4FF;">{{ totalItems.toLocaleString() }}</div><div class="stat-label">ITEMS DONATED</div></div>
      <div class="stat-box"><div class="stat-icon"><Users :size="20" color="#FF6B35" /></div><div class="stat-val" style="color:#FF6B35;">{{ totalFamilies }}</div><div class="stat-label">FAMILIES HELPED</div></div>
      <div class="stat-box"><div class="stat-icon"><CheckCircle :size="20" color="#00E5A0" /></div><div class="stat-val" style="color:#00E5A0;">{{ confirmed }}</div><div class="stat-label">DELIVERIES CONFIRMED</div></div>
    </div>

    <div class="two-col" style="margin-bottom:20px;">
      <div class="card" style="padding:1.5rem;">
        <div class="chart-title"><TrendingUp :size="14" style="display:inline; margin-right:6px;" /> Monthly Donation Trend</div>
        <canvas ref="barChartRef" height="120"></canvas>
      </div>
      <div class="card" style="padding:1.5rem;display:flex;align-items:center;gap:16px;">
        <canvas ref="pieChartRef" style="max-width:140px;max-height:140px;flex-shrink:0;"></canvas>
        <div style="flex:1;">
          <div class="chart-title" style="margin-bottom:12px;"><PieChart :size="14" style="display:inline; margin-right:6px;" /> Donor Type Breakdown</div>
          <div v-for="(d,i) in donorTypes" :key="d.name" style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:8px;height:8px;border-radius:2px;" :style="{ background: PIE_C[i%4] }"></div>
              <span style="font-size:12px;">{{ d.name }}</span>
            </div>
            <span style="font-family:'DM Mono',monospace;font-weight:700;" :style="{ color: PIE_C[i%4] }">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="card">
      <div class="chart-title"><Trophy :size="14" style="display:inline; margin-right:6px;" /> Donor Leaderboard</div>
      <div class="leaderboard">
        <div v-for="(d,i) in leaderboard" :key="d.id" class="leader-row">
          <div class="rank-circle" :style="{ background: i<3?rankBg[i]:'#1A253530', border:`1px solid ${i<3?rankColor[i]:'#1A2535'}`, color: i<3?rankColor[i]:'#4A6080' }">{{ i+1 }}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;">{{ d.donor }}</div>
            <div style="font-size:11px;color:#4A6080;">For {{ linkedBrgy(d.reportId) }}</div>
          </div>
          <div style="text-align:right;margin-right:12px;">
            <div style="font-size:14px;font-weight:900;color:#00E5A0;font-family:'DM Mono',monospace;">{{ itemTotal(d).toLocaleString() }}</div>
            <div style="font-size:10px;color:#4A6080;">total items</div>
          </div>
          <span class="badge" :style="badgeStyle(statusColor(d.status))">{{ (d.status || 'pending').toUpperCase().replace('-',' ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  HeartHandshake, 
  Package, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  PieChart, 
  Trophy 
} from 'lucide-vue-next'
const props = defineProps({ reports: Array, donations: Array })

const barChartRef = ref(null)
const pieChartRef = ref(null)
const PIE_C       = ['#00D4FF','#00E5A0','#FF6B35','#FFD23F']
const rankColor   = ['#FFD23F','#4A6080','#FF6B35']
const rankBg      = ['#FFD23F20','#4A608018','#FF6B3518']

const totalItems   = computed(() => props.donations.reduce((s,d)=>s+(d.items||[]).reduce((ss,i)=>ss+i.qty,0),0))
const totalFamilies= computed(() => props.reports.reduce((s,r)=>s+r.families,0))
const confirmed    = computed(() => props.donations.filter(d=>d.status==='received').length)
const donorTypes   = computed(() => [
  { name:'Government', value: props.donations.filter(d=>d.type==='Government').length },
  { name:'NGO',        value: props.donations.filter(d=>d.type==='NGO').length },
  { name:'Private',    value: props.donations.filter(d=>d.type==='Private'||d.type==='Private Company').length },
  { name:'Individual', value: props.donations.filter(d=>d.type==='Individual'||d.type==='Anonymous').length },
].filter(d=>d.value>0))
const leaderboard  = computed(() => [...props.donations].sort((a,b)=>itemTotal(b)-itemTotal(a)).slice(0,5))
const itemTotal    = d => (d.items||[]).reduce((s,i)=>s+i.qty,0)
const linkedBrgy   = id => props.reports.find(r=>r.id===id)?.brgy || id
const statusColor  = s => ({ received:'#00E5A0', 'in-transit':'#00D4FF', pending:'#FFD23F' })[s]||'#4A6080'
const badgeStyle   = c => ({ background:c+'18', border:`1px solid ${c}44`, color:c })

const monthlyData = [
  { month:'Oct', donations:8  }, { month:'Nov', donations:12 },
  { month:'Dec', donations:6  }, { month:'Jan', donations:4  },
  { month:'Feb', donations:5  }, { month:'Mar', donations: props.donations.length },
]

onMounted(async () => {
  const { Chart, registerables } = await import('https://cdn.jsdelivr.net/npm/chart.js@4/+esm')
  Chart.register(...registerables)
  const GRID = { color:'#1A2535' }
  const TICK = { color:'#4A6080', font:{ size:10, family:'DM Mono, monospace' } }

  if (barChartRef.value) new Chart(barChartRef.value, {
    type:'bar',
    data:{ labels: monthlyData.map(d=>d.month), datasets:[{ label:'Donations', data:monthlyData.map(d=>d.donations), backgroundColor:'#00E5A0', borderRadius:3 }] },
    options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }
  })

  if (pieChartRef.value) new Chart(pieChartRef.value, {
    type:'doughnut',
    data:{ labels:donorTypes.value.map(d=>d.name), datasets:[{ data:donorTypes.value.map(d=>d.value), backgroundColor:PIE_C, borderWidth:0 }] },
    options:{ plugins:{ legend:{ display:false } }, cutout:'55%' }
  })
})
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.portal-label{font-size:10px;color:#00E5A0;font-family:'DM Mono',monospace;letter-spacing:.12em;margin-bottom:4px}
.page-title{font-size:22px;font-weight:900}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat-box{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.2rem}
.stat-icon{font-size:20px;margin-bottom:8px}
.stat-val{font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1}
.stat-label{font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
.two-col{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem}
.chart-title{font-size:13px;font-weight:700;margin-bottom:14px;color:#00E5A0}
.leaderboard{display:flex;flex-direction:column;gap:8px}
.leader-row{display:flex;align-items:center;gap:14px;padding:10px 12px;background:#060A0F;border:1px solid #1A2535;border-radius:6px}
.rank-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;font-family:'DM Mono',monospace;flex-shrink:0}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
</style>
