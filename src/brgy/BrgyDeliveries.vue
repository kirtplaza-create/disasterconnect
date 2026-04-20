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
      <div style="margin-bottom:12px"><Truck :size="40" color="var(--text-dim)" /></div>
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
              <div class="progress-dot" :style="{ background: flowIdx(d) >= i ? sc[d.status] : 'var(--border-color)', color: flowIdx(d) >= i ? 'var(--bg-body)' : 'var(--text-secondary)' }">
                <Check v-if="flowIdx(d) >= i" :size="10" stroke-width="4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div v-if="i < 3" class="progress-line"
              :style="{ background: flowIdx(d) > i ? sc[d.status] : 'var(--border-color)' }"></div>
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
const sc     = { pending:'var(--text-secondary)', dispatched:'var(--color-warn)', 'in-transit':'var(--color-accent)', delivered:'var(--color-success)' }
const statusKeys = ['delivered','in-transit','dispatched','pending']

const mine     = props.deliveries.filter(d => d.brgy === BRGY)
const flowIdx  = d => flow.indexOf(d.status)
const statusIcon = s => ({ delivered: CheckCircle, 'in-transit': Truck, dispatched: Package, pending: Clock })[s] || Clock

const badgeStyle = s => {
  const c = sc[s] || 'var(--text-dim)'
  return { 
    background: `color-mix(in srgb, ${c}, transparent 90%)`, 
    border: `1px solid color-mix(in srgb, ${c}, transparent 70%)`, 
    color: c, 
    fontSize: '10px', padding: '2px 8px', borderRadius: '2px', fontFamily: 'monospace' 
  }
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
.page-title{font-size:22px;font-weight:900;color:var(--text-primary)}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat-box{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.2rem;position:relative;overflow:hidden}
.stat-glow{position:absolute;top:0;right:0;width:60px;height:60px;background:var(--c, color-mix(in srgb, var(--color-warn), transparent 97%));border-radius:0 8px 0 60px}
.stat-val{font-size:28px;font-weight:900;line-height:1}
.stat-label{font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
.mono{font-family:monospace}
.empty-state{text-align:center;padding:5rem;color:var(--text-secondary);display:flex;flex-direction:column;align-items:center}
.empty-title{font-size:15px;font-weight:700;margin-bottom:6px;color:var(--text-primary)}
.empty-sub{font-size:13px}

.dc-btn-primary { background:var(--color-warn);color:var(--bg-body);border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-primary:hover { opacity: 0.85; }

.dc-btn-green   { background:var(--color-success);color:var(--bg-body);border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-green:hover { opacity: 0.85; }

.dc-btn-outline { background:transparent;border:1px solid var(--color-warn);color:var(--color-warn);border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-outline:hover { background: color-mix(in srgb, var(--color-warn), transparent 92%); }

.dc-btn-danger  { background:var(--color-danger);color:var(--bg-body);border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-danger:hover { opacity: 0.85; }

.delivery-list{display:flex;flex-direction:column;gap:12px}
.delivery-card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.25rem;transition:all .2s}
.delivery-header{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.delivery-status-icon{font-size:16px}
.delivery-id{font-weight:800;font-size:14px;color:var(--text-primary)}
.delivery-ref{margin-left:auto;font-size:11px;color:var(--text-secondary);font-family:monospace}
.progress-row{display:flex;align-items:center;margin-bottom:12px}
.progress-node{display:flex;align-items:center}
.progress-dot{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0}
.progress-line{flex:1;height:2px;background:var(--border-color);transition:background .3s}
.items-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.item-chip{font-size:11px;background:color-mix(in srgb, var(--color-warn), transparent 91%);border:1px solid color-mix(in srgb, var(--color-warn), transparent 73%);color:var(--color-warn);border-radius:3px;padding:2px 8px;font-family:monospace}
.delivery-footer{display:flex;gap:16px;flex-wrap:wrap}
.footer-item{font-size:12px;color:var(--text-secondary)}
.footer-item.green{color:var(--color-success)}
.badge{font-family:monospace;font-size:10px;padding:2px 8px;border-radius:2px;display:inline-block}
</style>