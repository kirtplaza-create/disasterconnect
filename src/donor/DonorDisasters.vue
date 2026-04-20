<template>
  <div class="fade-up">
    <div style="margin-bottom:20px;">
      <h1 class="page-title">Active Disaster Reports</h1>
      <p class="page-sub">See where help is needed most and direct your donation</p>
    </div>
    <div class="card-list">
      <div v-for="r in reports" :key="r.id" class="report-card" :style="{ borderLeft:`3px solid ${sevColor(r.severity)}` }">
        <div style="flex:1;">
          <div class="report-top">
            <span class="report-brgy">{{ r.brgy }}</span>
            <span class="badge" :style="badgeStyle('#00D4FF')">{{ r.dtype }}</span>
            <span class="badge" :style="badgeStyle(sevColor(r.severity))">{{ r.severity }}</span>
            <span class="report-date">{{ r.date }}</span>
          </div>
          <div class="report-desc">{{ r.desc }}</div>
          <div class="needs-grid">
            <div v-for="row in needsRows(r)" :key="row.label" class="need-box">
              <div class="need-label"><component :is="row.icon" :size="10" style="display:inline; margin-right:4px;" /> {{ row.label }}</div>
              <div class="need-val" :style="{ color: row.color }">{{ row.val?.toLocaleString() }} <span style="font-size:10px;color:#4A6080;">{{ row.unit }}</span></div>
            </div>
          </div>
          <div class="people-row">
            <span v-for="[icon,val,label] in [[Users,r.families,'families'],[Users,r.individuals,'individuals'],[Footprints,r.evacuees,'evacuees']]" :key="label" class="people-chip">
              <component :is="icon" :size="12" style="display:inline; margin-right:4px;" /> <span style="color:#E2EAF4;font-weight:700;">{{ val }}</span> {{ label }}
            </span>
          </div>
        </div>
        <div style="flex-shrink:0;display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
          <button class="btn-primary" @click="donateTo(r.id)"><HeartHandshake :size="16" /> Donate for this Barangay</button>
          <span style="font-size:11px;color:#4A6080;">{{ r.muni }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Users, 
  Footprints, 
  HeartHandshake, 
  Box, 
  Droplet, 
  Stethoscope 
} from 'lucide-vue-next'
const props = defineProps({ reports: Array })
const emit  = defineEmits(['navigate','set-report'])

const sevColor   = s => ({ Critical:'#FF3B5C', High:'#FF6B35', Moderate:'#FFD23F', Low:'#00E5A0' })[s]||'#4A6080'
const badgeStyle = c => ({ background:c+'18', border:`1px solid ${c}44`, color:c })
const needsRows  = r => [
  { icon: Box, label: 'Food Packs', val: r.foodNeeded, unit: 'packs', color: '#FF6B35' },
  { icon: Droplet, label: 'Water', val: r.waterNeeded, unit: 'liters', color: '#00D4FF' },
  { icon: Stethoscope, label: 'Medical Kits', val: r.medNeeded, unit: 'kits', color: '#FF3B5C' }
]

function donateTo(id) {
  emit('set-report', id)
  emit('navigate','donor-donate')
}
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.page-title{font-size:22px;font-weight:900}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.card-list{display:flex;flex-direction:column;gap:12px}
.report-card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem;display:flex;align-items:flex-start;gap:16px}
.report-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.report-brgy{font-size:15px;font-weight:900}
.report-date{font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;margin-left:auto}
.report-desc{font-size:12px;color:#4A6080;margin-bottom:12px;line-height:1.7}
.needs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:8px}
.need-box{background:#060A0F;border:1px solid #1A2535;border-radius:6px;padding:8px 10px}
.need-label{font-size:11px;color:#4A6080;margin-bottom:2px}
.need-val{font-size:14px;font-weight:700}
.people-row{display:flex;gap:12px;flex-wrap:wrap}
.people-chip{font-size:12px;color:#4A6080}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
.btn-primary{background:#00E5A0;color:#060A0F;border:none;border-radius:6px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
</style>
