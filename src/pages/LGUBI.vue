<template>
  <div class="fade-up">
    <div style="margin-bottom:20px;">
      <div class="module-label">BUSINESS INTELLIGENCE</div>
      <h1 class="page-title">BI Analytics Dashboard</h1>
      <p class="page-sub">Data-driven insights for smarter disaster preparedness and response decisions</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button v-for="t in TABS" :key="t.id" class="tab"
        :style="{ borderBottomColor: biTab===t.id ? '#00D4FF':'transparent', color: biTab===t.id ? '#00D4FF':'#4A6080', fontWeight: biTab===t.id ? 700:400 }"
        @click="biTab = t.id">{{ t.label }}</button>
    </div>

    <!-- ── TAB: DISASTER TRENDS ── -->
    <div v-if="biTab === 'trends'" class="fade-up">
      <div class="bi-section">
        <div class="bi-section-header"><span class="bi-icon">📈</span><div><div class="bi-title">Monthly Disaster Incident Trend</div><div class="bi-sub">Historical disaster frequency over the last 8 months</div></div></div>
        <div class="card chart-card"><canvas ref="trendChartRef" height="100"></canvas></div>
      </div>

      <div class="two-col" style="margin-bottom:28px;">
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">👨‍👩‍👧‍👦</span><div><div class="bi-title">Affected Families per Month</div><div class="bi-sub">Total individuals affected</div></div></div>
          <div class="card chart-card"><canvas ref="affectedChartRef" height="120"></canvas></div>
        </div>
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">🌀</span><div><div class="bi-title">Disaster Type Distribution</div><div class="bi-sub">All-time incident breakdown</div></div></div>
          <div class="card chart-card"><canvas ref="dtypeChartRef" height="120"></canvas></div>
        </div>
      </div>

      <div class="two-col">
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">💰</span><div><div class="bi-title">Donation Volume Trend (₱)</div><div class="bi-sub">Total donations per month</div></div></div>
          <div class="card chart-card"><canvas ref="donVolChartRef" height="120"></canvas></div>
        </div>
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">📦</span><div><div class="bi-title">Donation Status Breakdown</div><div class="bi-sub">Current donation pipeline</div></div></div>
          <div class="card chart-card" style="display:flex;align-items:center;gap:24px;padding:1.5rem;">
            <canvas ref="donPieChartRef" style="max-width:180px;max-height:180px;"></canvas>
            <div style="flex:1;">
              <div v-for="(d,i) in donPie" :key="d.name" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:10px;height:10px;border-radius:2px;" :style="{ background: PIE_COLORS[i] }"></div>
                  <span style="font-size:13px;">{{ d.name }}</span>
                </div>
                <span style="font-family:'DM Mono',monospace;font-size:14px;font-weight:700;" :style="{ color: PIE_COLORS[i] }">{{ d.value }}</span>
              </div>
              <div style="margin-top:12px;padding-top:10px;border-top:1px solid #1A2535;font-size:12px;color:#4A6080;">
                Total Donations: <span style="color:#E2EAF4;font-weight:700;">{{ donations.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TAB: VULNERABILITY ── -->
    <div v-if="biTab === 'vulnerability'" class="fade-up">
      <div class="bi-section">
        <div class="bi-section-header"><span class="bi-icon">🗺️</span><div><div class="bi-title">Barangay Vulnerability Index</div><div class="bi-sub">Risk score from population density, disaster frequency, infra damage, evacuation readiness</div></div></div>
        <div class="risk-legend">
          <div v-for="[label,color,range] in [['High Risk','#FF3B5C','Score 65–100'],['Medium Risk','#FFD23F','Score 35–64'],['Low Risk','#00E5A0','Score 0–34']]" :key="label"
            class="risk-legend-item" :style="{ background:color+'12', border:`1px solid ${color}44` }">
            <div class="risk-dot" :style="{ background:color }"></div>
            <span :style="{ color, fontWeight:700, fontSize:'12px' }">{{ label }}</span>
            <span style="font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;">{{ range }}</span>
          </div>
        </div>
        <div class="risk-grid">
          <div v-for="b in sortedRisk" :key="b.name" class="card risk-card" :style="{ borderLeft:`3px solid ${zoneColor(b.zone)}` }">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
              <div>
                <div style="font-size:13px;font-weight:700;margin-bottom:4px;">{{ b.name }}</div>
                <span class="badge" :style="badgeStyle(zoneColor(b.zone))">{{ b.zone }} Risk</span>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1;" :style="{ color:zoneColor(b.zone) }">{{ b.riskScore }}</div>
                <div style="font-size:10px;color:#4A6080;font-family:'DM Mono',monospace;">/ 100</div>
              </div>
            </div>
            <div class="progress-bg"><div class="progress-fill" :style="{ width:b.riskScore+'%', background:zoneColor(b.zone) }"></div></div>
            <div class="risk-factors-grid">
              <div v-for="[k,v] in [['Pop. Density',b.popDensity],['Disaster Freq.',b.disasterFreq],['Infra. Damage',b.infraDmg],['Evac. Readiness',b.evacReadiness]]" :key="k" class="risk-factor">
                <div style="font-size:10px;color:#4A6080;font-family:'DM Mono',monospace;margin-bottom:2px;">{{ k }}</div>
                <div style="font-size:13px;font-weight:700;font-family:'DM Mono',monospace;">{{ v }}<span style="font-size:10px;color:#4A6080;">/10</span></div>
                <div class="progress-bg"><div class="progress-fill" :style="{ width:v*10+'%', background: v>=7?'#FF3B5C':v>=5?'#FFD23F':'#00E5A0' }"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bi-section" style="margin-top:16px;">
          <div class="bi-section-header"><span class="bi-icon">📊</span><div><div class="bi-title">Risk Factor Comparison</div></div></div>
          <div class="card chart-card"><canvas ref="riskChartRef" height="120"></canvas></div>
        </div>
      </div>
    </div>

    <!-- ── TAB: PERFORMANCE ── -->
    <div v-if="biTab === 'performance'" class="fade-up">
      <div class="kpi-grid">
        <div v-for="k in kpis" :key="k.label" class="card" style="text-align:center;">
          <div style="font-size:32px;font-weight:900;font-family:'DM Mono',monospace;line-height:1;" :style="{ color:k.color }">{{ k.value }}</div>
          <div style="font-size:12px;color:#4A6080;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;margin-top:6px;">{{ k.label }}</div>
          <div style="font-size:11px;margin-top:4px;" :style="{ color:k.color }">{{ k.sub }}</div>
        </div>
      </div>

      <div class="bi-section">
        <div class="bi-section-header"><span class="bi-icon">⏱️</span><div><div class="bi-title">Response & Delivery Time Trend</div><div class="bi-sub">Avg hours from report to response, and warehouse to delivery</div></div></div>
        <div class="card chart-card"><canvas ref="perfChartRef" height="100"></canvas></div>
      </div>

      <div class="two-col">
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">📦</span><div><div class="bi-title">Resource Utilization Rate</div></div></div>
          <div class="card chart-card"><canvas ref="utilChartRef" height="120"></canvas></div>
        </div>
        <div class="bi-section">
          <div class="bi-section-header"><span class="bi-icon">🏭</span><div><div class="bi-title">Resource Stock vs. Used</div></div></div>
          <div class="card chart-card"><canvas ref="stockChartRef" height="120"></canvas></div>
        </div>
      </div>

      <div class="bi-section">
        <div class="bi-section-header"><span class="bi-icon">🚚</span><div><div class="bi-title">Delivery Performance Breakdown</div></div></div>
        <div class="delivery-perf-grid">
          <div v-for="s in deliveryStats" :key="s.label" class="card" style="text-align:center;" :style="{ borderTop:`2px solid ${s.color}` }">
            <div style="font-size:22px;margin-bottom:4px;">{{ s.icon }}</div>
            <div style="font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1;" :style="{ color:s.color }">{{ s.count }}</div>
            <div style="font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;margin-top:4px;">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  reports:   { type: Array, required: true },
  deliveries:{ type: Array, required: true },
  donations: { type: Array, required: true },
  inventory: { type: Array, required: true },
})

const biTab = ref('trends')
const TABS = [
  { id:'trends',        label:'📊 Disaster Trends' },
  { id:'vulnerability', label:'📍 Vulnerability Index' },
  { id:'performance',   label:'🚚 Response Performance' },
]

// ── SEED DATA ──
const BI_MONTHLY_TREND = [
  { month:"Aug '24", floods:3, typhoons:1, landslides:0, affected:820,  donations:85000  },
  { month:"Sep '24", floods:5, typhoons:2, landslides:1, affected:1540, donations:142000 },
  { month:"Oct '24", floods:7, typhoons:4, landslides:2, affected:2980, donations:310000 },
  { month:"Nov '24", floods:6, typhoons:3, landslides:3, affected:2210, donations:220000 },
  { month:"Dec '24", floods:2, typhoons:1, landslides:1, affected:680,  donations:95000  },
  { month:"Jan '25", floods:1, typhoons:0, landslides:2, affected:340,  donations:42000  },
  { month:"Feb '25", floods:2, typhoons:0, landslides:1, affected:510,  donations:38000  },
  { month:"Mar '25", floods:4, typhoons:1, landslides:1, affected:1110, donations:252000 },
]
const BI_BARANGAY_RISK = [
  { name:"Brgy. Riverside",    popDensity:8, disasterFreq:9, infraDmg:7, evacReadiness:5, riskScore:78, zone:"High" },
  { name:"Brgy. Mahogany",     popDensity:7, disasterFreq:8, infraDmg:9, evacReadiness:3, riskScore:85, zone:"High" },
  { name:"Brgy. San Isidro",   popDensity:5, disasterFreq:5, infraDmg:6, evacReadiness:6, riskScore:52, zone:"Medium" },
  { name:"Brgy. Mabini",       popDensity:4, disasterFreq:3, infraDmg:3, evacReadiness:8, riskScore:31, zone:"Low" },
  { name:"Brgy. Del Monte",    popDensity:6, disasterFreq:6, infraDmg:5, evacReadiness:5, riskScore:58, zone:"Medium" },
  { name:"Brgy. Bagong Silang",popDensity:7, disasterFreq:7, infraDmg:8, evacReadiness:4, riskScore:74, zone:"High" },
  { name:"Brgy. Sta. Cruz",    popDensity:3, disasterFreq:2, infraDmg:2, evacReadiness:9, riskScore:22, zone:"Low" },
  { name:"Brgy. Catalunan",    popDensity:5, disasterFreq:4, infraDmg:4, evacReadiness:7, riskScore:44, zone:"Medium" },
]
const BI_RESPONSE_PERF = [
  { period:"Oct '24", avgResponseHrs:5.2, avgDeliveryHrs:8.4, utilizationPct:91 },
  { period:"Nov '24", avgResponseHrs:4.8, avgDeliveryHrs:7.9, utilizationPct:88 },
  { period:"Dec '24", avgResponseHrs:3.9, avgDeliveryHrs:6.2, utilizationPct:76 },
  { period:"Jan '25", avgResponseHrs:3.5, avgDeliveryHrs:5.8, utilizationPct:70 },
  { period:"Feb '25", avgResponseHrs:3.1, avgDeliveryHrs:5.2, utilizationPct:74 },
  { period:"Mar '25", avgResponseHrs:2.8, avgDeliveryHrs:4.7, utilizationPct:83 },
]

// ── COMPUTED ──
const zoneColor  = (z) => ({ High:'#FF3B5C', Medium:'#FFD23F', Low:'#00E5A0' })[z]
const badgeStyle = (c) => ({ background:c+'18', border:`1px solid ${c}44`, color:c })
const sortedRisk = computed(() => [...BI_BARANGAY_RISK].sort((a,b) => b.riskScore - a.riskScore))
const PIE_COLORS = ['#00E5A0','#00D4FF','#FFD23F']
const donPie = computed(() => [
  { name:'Received',  value: props.donations.filter(d=>d.status==='received').length },
  { name:'In-Transit',value: props.donations.filter(d=>d.status==='in-transit').length },
  { name:'Pending',   value: props.donations.filter(d=>d.status==='pending').length },
])
const dtypeCounts = computed(() => {
  const base = { Flood:22, Typhoon:12, Landslide:10, Earthquake:3 }
  props.reports.forEach(r => { base[r.dtype] = (base[r.dtype]||0) + 1 })
  return Object.entries(base).map(([name,value]) => ({ name, value }))
})
const liveResourceDist = computed(() => {
  const invMap = Object.fromEntries(props.inventory.map(i => [i.item, i.available]))
  return [
    { name:'Food Packs',  used: props.reports.reduce((s,r)=>s+(r.foodNeeded||0),0),  remaining: invMap['Food Packs']||0 },
    { name:'Water (L)',   used: props.reports.reduce((s,r)=>s+(r.waterNeeded||0),0), remaining: invMap['Drinking Water']||0 },
    { name:'Medical Kits',used: props.reports.reduce((s,r)=>s+(r.medNeeded||0),0),   remaining: invMap['Medical Kits']||0 },
  ]
})
const kpis = [
  { label:'Avg. Response Time', value:'2.8 hrs', sub:'↓ 46% vs Oct \'24', color:'#00E5A0' },
  { label:'Avg. Delivery Time', value:'4.7 hrs', sub:'↓ 44% vs Oct \'24', color:'#00E5A0' },
  { label:'Resource Utilization',value:'83%',    sub:'↑ from 70% in Jan \'25', color:'#00D4FF' },
]
const deliveryStats = computed(() => [
  { label:'Delivered',  count: props.deliveries.filter(d=>d.status==='delivered').length,  color:'#00E5A0', icon:'✅' },
  { label:'In-Transit', count: props.deliveries.filter(d=>d.status==='in-transit').length, color:'#00D4FF', icon:'🚚' },
  { label:'Dispatched', count: props.deliveries.filter(d=>d.status==='dispatched').length, color:'#FFD23F', icon:'📦' },
  { label:'Pending',    count: props.deliveries.filter(d=>d.status==='pending').length,    color:'#4A6080', icon:'⏳' },
])

// ── CHART REFS ──
const trendChartRef   = ref(null)
const affectedChartRef= ref(null)
const dtypeChartRef   = ref(null)
const donVolChartRef  = ref(null)
const donPieChartRef  = ref(null)
const riskChartRef    = ref(null)
const perfChartRef    = ref(null)
const utilChartRef    = ref(null)
const stockChartRef   = ref(null)

const chartInstances = {}

function destroyChart(key) {
  if (chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key] }
}

const GRID = { color:'#1A2535' }
const TICK = { color:'#4A6080', font:{ size:10, family:'DM Mono, monospace' } }

async function loadCharts() {
  const { Chart, registerables } = await import('https://cdn.jsdelivr.net/npm/chart.js@4/+esm')
  Chart.register(...registerables)

  if (biTab.value === 'trends') {
    await nextTick()

    destroyChart('trend')
    if (trendChartRef.value) chartInstances['trend'] = new Chart(trendChartRef.value, {
      type:'line',
      data:{ labels: BI_MONTHLY_TREND.map(d=>d.month),
        datasets:[
          { label:'Floods',     data:BI_MONTHLY_TREND.map(d=>d.floods),     borderColor:'#00D4FF', tension:.4, pointRadius:3 },
          { label:'Typhoons',   data:BI_MONTHLY_TREND.map(d=>d.typhoons),   borderColor:'#FF3B5C', tension:.4, pointRadius:3 },
          { label:'Landslides', data:BI_MONTHLY_TREND.map(d=>d.landslides), borderColor:'#FFD23F', tension:.4, pointRadius:3 },
        ]},
      options:{ plugins:{ legend:{ labels:{ color:'#4A6080', font:{ size:11 } } } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }
    })

    destroyChart('affected')
    if (affectedChartRef.value) chartInstances['affected'] = new Chart(affectedChartRef.value, {
      type:'bar',
      data:{ labels:BI_MONTHLY_TREND.map(d=>d.month), datasets:[{ label:'Affected', data:BI_MONTHLY_TREND.map(d=>d.affected), backgroundColor:'#FF6B35', borderRadius:3 }] },
      options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }
    })

    destroyChart('dtype')
    if (dtypeChartRef.value) chartInstances['dtype'] = new Chart(dtypeChartRef.value, {
      type:'bar',
      data:{ labels:dtypeCounts.value.map(d=>d.name), datasets:[{ label:'Incidents', data:dtypeCounts.value.map(d=>d.value), backgroundColor:['#00D4FF','#FF3B5C','#FFD23F','#00E5A0'], borderRadius:3 }] },
      options:{ indexAxis:'y', plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:TICK } } }
    })

    destroyChart('donvol')
    if (donVolChartRef.value) chartInstances['donvol'] = new Chart(donVolChartRef.value, {
      type:'bar',
      data:{ labels:BI_MONTHLY_TREND.map(d=>d.month), datasets:[{ label:'Donations (₱)', data:BI_MONTHLY_TREND.map(d=>d.donations), backgroundColor:'#00E5A0', borderRadius:3 }] },
      options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:{ ...TICK, callback:v=>`₱${(v/1000).toFixed(0)}k` } } } }
    })

    destroyChart('donpie')
    if (donPieChartRef.value) chartInstances['donpie'] = new Chart(donPieChartRef.value, {
      type:'doughnut',
      data:{ labels:donPie.value.map(d=>d.name), datasets:[{ data:donPie.value.map(d=>d.value), backgroundColor:PIE_COLORS, borderWidth:0 }] },
      options:{ plugins:{ legend:{ display:false } }, cutout:'60%' }
    })
  }

  if (biTab.value === 'vulnerability') {
    await nextTick()
    destroyChart('risk')
    if (riskChartRef.value) chartInstances['risk'] = new Chart(riskChartRef.value, {
      type:'bar',
      data:{ labels:BI_BARANGAY_RISK.map(b=>b.name.replace('Brgy. ','')),
        datasets:[
          { label:'Pop. Density',  data:BI_BARANGAY_RISK.map(b=>b.popDensity),  backgroundColor:'#00D4FF', borderRadius:2 },
          { label:'Disaster Freq.',data:BI_BARANGAY_RISK.map(b=>b.disasterFreq), backgroundColor:'#FF3B5C', borderRadius:2 },
          { label:'Infra. Damage', data:BI_BARANGAY_RISK.map(b=>b.infraDmg),    backgroundColor:'#FFD23F', borderRadius:2 },
          { label:'Evac. Readiness',data:BI_BARANGAY_RISK.map(b=>b.evacReadiness),backgroundColor:'#00E5A0',borderRadius:2 },
        ]},
      options:{ plugins:{ legend:{ labels:{ color:'#4A6080', font:{size:11} } } }, scales:{ x:{ grid:GRID, ticks:{ ...TICK, maxRotation:30 } }, y:{ grid:GRID, ticks:TICK, max:10 } } }
    })
  }

  if (biTab.value === 'performance') {
    await nextTick()
    destroyChart('perf')
    if (perfChartRef.value) chartInstances['perf'] = new Chart(perfChartRef.value, {
      type:'line',
      data:{ labels:BI_RESPONSE_PERF.map(d=>d.period),
        datasets:[
          { label:'Avg Response (hrs)', data:BI_RESPONSE_PERF.map(d=>d.avgResponseHrs), borderColor:'#00D4FF', tension:.4, pointRadius:4, borderWidth:2.5 },
          { label:'Avg Delivery (hrs)', data:BI_RESPONSE_PERF.map(d=>d.avgDeliveryHrs), borderColor:'#FF6B35', tension:.4, pointRadius:4, borderWidth:2.5 },
        ]},
      options:{ plugins:{ legend:{ labels:{ color:'#4A6080', font:{size:11} } } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:{ ...TICK, callback:v=>v+'h' } } } }
    })

    destroyChart('util')
    if (utilChartRef.value) chartInstances['util'] = new Chart(utilChartRef.value, {
      type:'bar',
      data:{ labels:BI_RESPONSE_PERF.map(d=>d.period), datasets:[{ label:'Utilization %', data:BI_RESPONSE_PERF.map(d=>d.utilizationPct), backgroundColor:BI_RESPONSE_PERF.map(d=>d.utilizationPct>=85?'#00E5A0':d.utilizationPct>=70?'#00D4FF':'#FFD23F'), borderRadius:3 }] },
      options:{ plugins:{ legend:{ display:false } }, scales:{ x:{ grid:GRID, ticks:TICK }, y:{ grid:GRID, ticks:{ ...TICK, callback:v=>v+'%' }, max:100 } } }
    })

    destroyChart('stock')
    if (stockChartRef.value) chartInstances['stock'] = new Chart(stockChartRef.value, {
      type:'bar',
      data:{ labels:liveResourceDist.value.map(d=>d.name),
        datasets:[
          { label:'Used',      data:liveResourceDist.value.map(d=>d.used),      backgroundColor:'#FF6B35', borderRadius:2, stack:'a' },
          { label:'Remaining', data:liveResourceDist.value.map(d=>d.remaining), backgroundColor:'#00E5A0', borderRadius:2, stack:'a' },
        ]},
      options:{ indexAxis:'y', plugins:{ legend:{ labels:{ color:'#4A6080', font:{size:11} } } }, scales:{ x:{ grid:GRID, ticks:TICK, stacked:true }, y:{ grid:GRID, ticks:TICK, stacked:true } } }
    })
  }
}

// nextTick helper
function nextTick() { return new Promise(r => setTimeout(r, 50)) }

onMounted(() => loadCharts())
watch(biTab, () => loadCharts())
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.module-label{font-size:10px;color:#00D4FF;font-family:'DM Mono',monospace;letter-spacing:.12em;margin-bottom:4px}
.page-title{font-size:22px;font-weight:800}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.tabs{display:flex;border-bottom:1px solid #1A2535;margin-bottom:24px}
.tab{padding:10px 20px;background:none;border:none;border-bottom:2px solid transparent;font-size:12px;cursor:pointer;margin-bottom:-1px;white-space:nowrap;transition:all .15s;font-family:'Outfit',sans-serif}
.bi-section{margin-bottom:28px}
.bi-section-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #1A2535}
.bi-icon{font-size:18px}
.bi-title{font-size:15px;font-weight:800}
.bi-sub{font-size:12px;color:#4A6080;margin-top:1px}
.card{background:#0D1219;border:1px solid #1A2535;border-radius:6px;padding:1.25rem}
.chart-card{padding:1.5rem}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.risk-legend{display:flex;gap:16px;margin-bottom:16px}
.risk-legend-item{display:flex;align-items:center;gap:8px;border-radius:4px;padding:6px 14px}
.risk-dot{width:10px;height:10px;border-radius:50%}
.risk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:24px}
.risk-card{border-radius:6px}
.progress-bg{height:4px;background:#1A2535;border-radius:2px;overflow:hidden;margin-top:4px}
.progress-fill{height:100%;border-radius:2px;transition:width .8s}
.risk-factors-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px}
.risk-factor{background:#060A0F;border:1px solid #1A2535;border-radius:4px;padding:6px 8px}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}
.delivery-perf-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500}
</style>
