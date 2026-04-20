<template>
  <div class="fade-up">
    <div style="margin-bottom:20px;">
      <h1 class="page-title">My Donations</h1>
      <p class="page-sub">Track every donation you've made — full transparency from submission to delivery</p>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-icon"><Package :size="20" color="var(--color-success)" /></div><div class="stat-val" style="color:var(--color-success);">{{ donations.length }}</div><div class="stat-label">TOTAL DONATIONS</div></div>
      <div class="stat-box"><div class="stat-icon"><CheckCircle :size="20" color="var(--color-success)" /></div><div class="stat-val" style="color:var(--color-success);">{{ confirmed }}</div><div class="stat-label">CONFIRMED RECEIVED</div></div>
      <div class="stat-box"><div class="stat-icon"><Clock :size="20" color="var(--color-warn)" /></div><div class="stat-val" style="color:var(--color-warn);">{{ inProgress }}</div><div class="stat-label">IN PROGRESS</div></div>
    </div>

    <div class="card-list">
      <div v-for="d in donations" :key="d.id" class="don-card" :style="{ borderTop:`2px solid ${statusColor(d.status)}` }">
        <div class="don-icon"><component :is="statusIcon[d.status]||Package" :size="24" :color="statusColor(d.status)" /></div>
        <div style="flex:1;">
          <div class="don-top">
            <span class="don-name">{{ d.donor }}</span>
            <span class="badge" :style="badgeStyle('var(--color-accent)')">{{ d.type }}</span>
            <span class="badge" :style="badgeStyle(statusColor(d.status))">{{ (d.status || 'pending').toUpperCase().replace('-',' ') }}</span>
            <span class="don-meta">{{ d.id }} · {{ d.date }}</span>
          </div>

          <!-- Progress pipeline -->
          <div class="pipeline">
            <div v-for="(s,i) in deliverySteps" :key="s" style="display:flex;align-items:center;flex:1;">
              <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                <div class="pipe-node" :style="{ background: i<=stepOf(d)?statusColor(d.status):'var(--border-color)', color: i<=stepOf(d)?'var(--bg-body)':'var(--text-secondary)' }">
                  {{ i<=stepOf(d)?'✓':i+1 }}
                </div>
                <div class="pipe-label" :style="{ color: i<=stepOf(d)?'var(--text-primary)':'var(--text-secondary)' }">{{ s }}</div>
              </div>
              <div v-if="i<deliverySteps.length-1" class="pipe-line" :style="{ background: i<stepOf(d)?statusColor(d.status):'var(--border-color)' }"></div>
            </div>
          </div>

          <div class="item-tags">
            <div v-for="(it,i) in (d.items||[])" :key="i" class="item-tag">
              <span style="color:var(--color-success);font-weight:700;">{{ it.qty }}</span>
              <span style="color:var(--text-secondary);"> {{ it.unit }} </span>
              <span>{{ it.name }}</span>
            </div>
          </div>
          <div v-if="d.message" class="don-message"><MessageSquare :size="12" style="display:inline; margin-right:4px;" /> "{{ d.message }}"</div>
        </div>
      </div>
      <div v-if="donations.length===0" class="empty">No donations yet. Make your first donation!</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  MessageSquare 
} from 'lucide-vue-next'
const props = defineProps({ donations: Array })

const confirmed  = computed(() => props.donations.filter(d=>d.status==='received').length)
const inProgress = computed(() => props.donations.filter(d=>d.status!=='received').length)

const deliverySteps = ['Logged','LGU Verified','In Transit','Delivered']
const statusIcon    = { received: CheckCircle, 'in-transit': Truck, pending: Clock }
const statusColor   = s => ({ received:'var(--color-success)', 'in-transit':'var(--color-accent)', pending:'var(--color-warn)' })[s]||'var(--text-secondary)'
const badgeStyle    = c => ({ 
  background: `color-mix(in srgb, ${c}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${c}, transparent 73%)`, 
  color: c 
})
const stepOf        = d => d.status==='received'?3:d.status==='in-transit'?2:d.status==='pending'?1:0
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.page-title{font-size:22px;font-weight:900}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.stat-box{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.2rem}
.stat-icon{font-size:20px;margin-bottom:8px}
.stat-val{font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1}
.stat-label{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
.card-list{display:flex;flex-direction:column;gap:14px}
.don-card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.25rem;display:flex;align-items:flex-start;gap:16px}
.don-icon{font-size:24px;flex-shrink:0}
.don-top{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap}
.don-name{font-size:14px;font-weight:800}
.don-meta{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;margin-left:auto}
.pipeline{display:flex;align-items:center;margin-bottom:10px}
.pipe-node{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0;transition:background .3s}
.pipe-line{flex:1;height:2px;margin-bottom:14px;transition:background .3s}
.pipe-label{font-size:9px;text-align:center;font-family:'DM Mono',monospace;letter-spacing:.02em;width:52px}
.item-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.item-tag{background:var(--bg-body);border:1px solid var(--border-color);border-radius:4px;padding:3px 10px;font-size:12px;font-family:'DM Mono',monospace}
.don-message{font-size:12px;color:var(--text-secondary);font-style:italic}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
.empty{text-align:center;padding:4rem;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;font-size:13px}
</style>
