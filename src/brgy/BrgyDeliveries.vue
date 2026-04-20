<template>
  <div class="fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Relief Status</h1>
        <p class="page-sub">Track all incoming relief goods dispatched to your barangay</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <StatBox v-for="s in statusKeys" :key="s" :label="s.toUpperCase().replace('-',' ')"
        :value="mine.filter(d=>d.status===s).length" :color="sc[s]" />
    </div>

    <!-- Empty -->
    <div v-if="mine.length === 0" class="empty-state">
      <div style="margin-bottom:12px"><Truck :size="40" color="#4A6080" /></div>
      <div class="empty-title">No deliveries yet</div>
      <div class="empty-sub">Deliveries will appear here once dispatched by the LGU.</div>
    </div>

    <!-- Delivery Cards -->
    <div v-else class="delivery-list">
      <div v-for="d in mine" :key="d.id" class="delivery-card" :style="{ borderTop: `2px solid ${sc[d.status]}` }">

        <!-- Header -->
        <div class="delivery-header">
          <span class="delivery-status-icon"><component :is="statusIcon(d.status)" :size="16" :color="sc[d.status]" /></span>
          <span class="delivery-id">{{ d.id }}</span>
          <span class="badge" :style="badgeStyle(d.status)">{{ (d.status || 'pending').toUpperCase().replace('-',' ') }}</span>
          <span class="delivery-ref">{{ d.reportId }}</span>
        </div>

        <!-- Progress bar -->
        <div class="progress-row">
          <template v-for="(s, i) in flow" :key="s">
            <div class="progress-node" :class="{ done: flowIdx(d) >= i }">
              <div class="progress-dot" :style="{ background: flowIdx(d) >= i ? sc[d.status] : '#1A2535', color: flowIdx(d) >= i ? '#060A0F' : '#4A6080' }">
                <Check v-if="flowIdx(d) >= i" :size="10" />
                <span v-else>{{ i+1 }}</span>
              </div>
            </div>
            <div v-if="i < flow.length - 1" class="progress-line"
              :style="{ background: flowIdx(d) > i ? sc[d.status] : '#1A2535' }">
            </div>
          </template>
        </div>

        <!-- Items -->
        <div class="items-row">
          <span v-for="(it, i) in d.items" :key="i" class="item-chip">
            {{ it.qty }} {{ it.unit }} {{ it.name }}
          </span>
        </div>

        <!-- Driver info -->
        <div class="delivery-footer">
          <span class="footer-item"><Car :size="14" style="display:inline; margin-right:4px;" /> {{ d.driver }} · {{ d.vehicle }}</span>
          <span v-if="d.dispatchTime" class="footer-item muted"><Send :size="14" style="display:inline; margin-right:4px;" /> {{ d.dispatchTime }}</span>
          <span v-if="d.arrivalTime"  class="footer-item green"><CheckCircle :size="14" style="display:inline; margin-right:4px;" /> Arrived: {{ d.arrivalTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Truck, 
  CheckCircle, 
  Package, 
  Clock, 
  Check, 
  Car, 
  Send 
} from 'lucide-vue-next'
const props = defineProps({
  deliveries: { type: Array, default: () => [] }
})

const BRGY   = 'Barangay Riverside'
const flow   = ['pending','dispatched','in-transit','delivered']
const sc     = { pending:'#4A6080', dispatched:'#FFD23F', 'in-transit':'#00D4FF', delivered:'#00E5A0' }
const statusKeys = ['delivered','in-transit','dispatched','pending']

const mine     = props.deliveries.filter(d => d.brgy === BRGY)
const flowIdx  = d => flow.indexOf(d.status)
const statusIcon = s => ({ delivered: CheckCircle, 'in-transit': Truck, dispatched: Package, pending: Clock })[s] || Clock

const badgeStyle = s => {
  const c = sc[s] || '#4A6080'
  return { background:`${c}18`, border:`1px solid ${c}44`, color:c, fontSize:'10px', padding:'2px 8px', borderRadius:'2px', fontFamily:'monospace' }
}

// StatBox component
const StatBox = {
  props:['label','value','color'],
  template:`<div class="stat-box" :style="{'--c':color}"><div class="stat-glow"></div><div class="stat-val mono" :style="{color}">{{value}}</div><div class="stat-label">{{label}}</div></div>`
}
</script>

<script>
const StatBox = {
  props:['label','value','color'],
  template:`<div class="stat-box" :style="{'--c':color}"><div class="stat-glow"></div><div class="stat-val mono" :style="{color}">{{value}}</div><div class="stat-label">{{label}}</div></div>`
}
export default { components:{ StatBox } }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
*{box-sizing:border-box;font-family:'Outfit','Segoe UI',sans-serif}

.page-header{margin-bottom:20px}
.page-title{font-size:22px;font-weight:900;color:#E2EAF4}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat-box{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.2rem;position:relative;overflow:hidden}
.stat-glow{position:absolute;top:0;right:0;width:60px;height:60px;background:var(--c,#FFD23F08);border-radius:0 8px 0 60px}
.stat-val{font-size:28px;font-weight:900;line-height:1}
.stat-label{font-size:11px;color:#4A6080;font-family:monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
.mono{font-family:monospace}
.empty-state{text-align:center;padding:5rem;color:#4A6080;display:flex;flex-direction:column;align-items:center}
.empty-title{font-size:15px;font-weight:700;margin-bottom:6px;color:#E2EAF4}
.empty-sub{font-size:13px}
.delivery-list{display:flex;flex-direction:column;gap:12px}
.delivery-card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem;transition:all .2s}
.delivery-header{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.delivery-status-icon{font-size:16px}
.delivery-id{font-weight:800;font-size:14px;color:#E2EAF4}
.delivery-ref{margin-left:auto;font-size:11px;color:#4A6080;font-family:monospace}
.progress-row{display:flex;align-items:center;margin-bottom:12px}
.progress-node{display:flex;align-items:center}
.progress-dot{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0}
.progress-line{flex:1;height:2px;background:#1A2535;transition:background .3s}
.items-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.item-chip{font-size:11px;background:#FFD23F12;border:1px solid #FFD23F33;color:#FFD23F;border-radius:3px;padding:2px 8px;font-family:monospace}
.delivery-footer{display:flex;gap:16px;flex-wrap:wrap}
.footer-item{font-size:12px;color:#4A6080}
.footer-item.green{color:#00E5A0}
.badge{font-family:monospace;font-size:10px;padding:2px 8px;border-radius:2px;display:inline-block}
</style>