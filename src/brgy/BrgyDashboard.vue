<template>
  <div class="fade-up">

    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-icon float"><Home :size="40" /></div>
      <div class="hero-text">
        <div class="portal-label">BARANGAY PORTAL</div>
        <div class="hero-title">Good day, Barangay Riverside!</div>
        <div class="hero-sub">Overview of your registered residents, needs, and disaster reports.</div>
      </div>
      <div class="hero-actions">
        <button class="btn-primary" @click="$emit('navigate', 'submit')"><ClipboardList :size="16" /> Submit Report</button>
        <button class="btn-outline" @click="$emit('navigate', 'residents')"><Users :size="16" /> Manage Residents</button>
      </div>
    </div>

    <!-- Top stat row -->
    <div class="stat-grid">
      <StatBox :icon="Users" label="Registered Families" :value="totalFamilies" color="var(--color-warn)" />
      <StatBox :icon="Users"    label="Total Individuals"   :value="totalMembers"  color="var(--color-accent)" />
      <StatBox :icon="AlertTriangle"   label="Vulnerable Families"  :value="vulnerable"    color="var(--color-danger)" />
      <StatBox :icon="ClipboardList"    label="Reports Filed"        :value="reports.length" color="var(--color-success)" />
    </div>

    <!-- Middle row -->
    <div class="two-col" style="margin-bottom:16px">

      <!-- Status Breakdown -->
      <div class="card">
        <div class="card-header">
          <span><Users :size="14" style="margin-right:6px; vertical-align:middle;" /> Resident Status Breakdown</span>
          <button class="link-btn" @click="$emit('navigate', 'residents')">View All →</button>
        </div>
        <div v-if="totalFamilies === 0" class="empty-sm">
          No residents registered yet.
          <button class="btn-primary sm" @click="$emit('add-family')" style="margin-top:10px">+ Add First Family</button>
        </div>
        <template v-else>
          <div v-for="s in statusRows" :key="s.label" class="status-row">
            <span class="status-icon"><component :is="s.icon" :size="16" /></span>
            <span class="status-label">{{ s.label }}</span>
            <div class="bar-wrap">
              <div class="bar-fill" :style="{ width: barWidth(s.value, totalFamilies) + '%', background: s.color }"></div>
            </div>
            <span class="status-val" :style="{ color: s.color }">{{ s.value }}</span>
          </div>
          <div class="row-footer">
            <span>Total families registered</span>
            <span class="mono yellow">{{ totalFamilies }}</span>
          </div>
        </template>
      </div>

      <!-- Community Needs Summary -->
      <div class="card">
        <div class="card-title"><Activity :size="14" style="margin-right:6px; vertical-align:middle;" /> Community Needs Summary</div>
        <div v-if="totalFamilies === 0" class="empty-sm">Register residents to see their needs here.</div>
        <template v-else>
          <div v-for="n in needRows" :key="n.name" class="need-row">
            <div class="need-top">
              <span class="need-icon"><component :is="needIcons[n.name]" :size="18" /></span>
              <span class="need-label">{{ n.name }}</span>
              <div class="need-total">
                <span class="mono yellow">{{ n.total }}</span>
                <span class="need-unit">{{ n.unit }}</span>
              </div>
            </div>
            <div class="need-bar-row">
              <div class="bar-wrap">
                <div class="bar-fill yellow-fill"
                  :style="{ width: needBarWidth(n) + '%' }">
                </div>
              </div>
              <span class="need-meta">{{ n.families }} {{ n.families === 1 ? 'family' : 'families' }} · {{ n.name === 'Water' ? n.total + 'L' : n.total + ' ' + n.unit }}</span>
            </div>
          </div>
          <div class="row-footer">
            <span>Families with other needs</span>
            <span class="mono yellow">{{ residents.filter(r => r.otherNeeds && r.otherNeeds.trim()).length }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="three-col">

      <!-- Vulnerable Groups -->
      <div class="card">
        <div class="card-title red"><AlertTriangle :size="14" style="margin-right:6px; vertical-align:middle;" /> Vulnerable Groups</div>
        <div v-if="vulnGroups.length === 0" class="empty-sm">
          {{ totalFamilies === 0 ? 'No residents yet.' : 'No vulnerable groups recorded.' }}
        </div>
        <div v-else class="vuln-list">
          <div v-for="v in vulnGroups" :key="v.name" class="vuln-row">
            <span>{{ v.name }}</span>
            <span class="mono red">{{ v.count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Families -->
      <div class="card">
        <div class="card-header">
          <span><Home :size="14" style="margin-right:6px; vertical-align:middle;" /> Recently Registered Families</span>
          <button v-if="residents.length > 0" class="link-btn" @click="$emit('navigate', 'residents')">See All →</button>
        </div>
        <div v-if="residents.length === 0" class="empty-sm">
          No families registered yet.
          <button class="btn-primary sm" @click="$emit('add-family')" style="margin-top:10px">+ Register Family</button>
        </div>
        <div v-else class="family-list">
          <div v-for="f in recentFamilies" :key="f.id" class="family-row" @click="$emit('navigate', 'residents')">
            <div class="family-icon"><Users :size="16" /></div>
            <div class="family-info">
              <div class="family-name">{{ f.familyName }}</div>
              <div class="family-meta">{{ f.members.length }} member{{ f.members.length !== 1 ? 's' : '' }}</div>
            </div>
            <StatusBadge :status="f.status" />
          </div>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="card">
        <div class="card-title green"><ClipboardList :size="14" style="margin-right:6px; vertical-align:middle;" /> Recent Reports</div>
        <div v-if="reports.length === 0" class="empty-sm" style="margin-bottom:12px">No reports filed yet.</div>
        <div v-else class="report-mini-list">
          <div v-for="r in recentReports" :key="r.id" class="report-mini">
            <div class="report-mini-top">
              <span class="report-mini-type">{{ r.dtype }}</span>
              <span class="badge" :style="badgeStyle(r.status)">{{ (r.status || 'pending').toUpperCase() }}</span>
            </div>
            <div class="report-mini-sub">{{ r.date }} · {{ r.families }} families</div>
          </div>
        </div>
        <button class="btn-primary full-w sm" @click="$emit('navigate', 'submit')"><ClipboardList :size="14" /> Submit New Report</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Home, 
  Users, 
  AlertTriangle, 
  ClipboardList, 
  Activity, 
  Footprints, 
  Package, 
  HelpCircle,
  Box,
  Droplet,
  Stethoscope,
  Bed,
  ArrowRight
} from 'lucide-vue-next'

const props = defineProps({
  reports:   { type: Array, default: () => [] },
  deliveries:{ type: Array, default: () => [] },
  residents: { type: Array, default: () => [] },
})
defineEmits(['navigate', 'add-family'])

// ── Computed ──────────────────────────────────────────────────────────────────
const totalFamilies = computed(() => props.residents.length)
const totalMembers  = computed(() => props.residents.reduce((s,r) => s + (r.members ? r.members.length : 0), 0))
const vulnerable    = computed(() => props.residents.filter(r => r.vulnerableGroups && r.vulnerableGroups.length > 0).length)

const statusRows = computed(() => [
  { label:'At Home',   value: props.residents.filter(r=>r.status==='At Home').length,   color:'var(--color-success)', icon: Home },
  { label:'Evacuated', value: props.residents.filter(r=>r.status==='Evacuated').length, color:'var(--color-warn)', icon: Footprints },
  { label:'Relocated', value: props.residents.filter(r=>r.status==='Relocated').length, color:'var(--color-accent)', icon: Package },
  { label:'Missing',   value: props.residents.filter(r=>r.status==='Missing').length,   color:'var(--color-danger)', icon: HelpCircle },
])

const needIcons = { Food: Box, Water: Droplet, Medicine: Stethoscope, Blanket: Bed }
const needRows = computed(() => ['Food','Water','Medicine','Blanket'].map(n => ({
  name: n,
  families: props.residents.filter(r => r.needs && r.needs.includes(n)).length,
  total: n === 'Water'
    ? props.residents.filter(r=>r.needs&&r.needs.includes(n)).reduce((s,r)=>s+r.members.length*3,0)
    : props.residents.filter(r=>r.needs&&r.needs.includes(n)).reduce((s,r)=>s+r.members.length,0),
  unit: n === 'Water' ? 'L' : n === 'Medicine' ? 'kits' : 'packs',
})))

const vulnGroups = computed(() =>
  ['Elderly','Children','Pregnant','Disabled','PWD','Solo Parent']
    .map(v => ({ name:v, count: props.residents.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.includes(v)).length }))
    .filter(v => v.count > 0)
)

const recentFamilies = computed(() => [...props.residents].reverse().slice(0,4))
const recentReports  = computed(() => props.reports.slice(-3).reverse())

// ── Components ────────────────────────────────────────────────────────────────
import { h } from 'vue'
const StatBox = (props) => {
  const { icon, label, value, color, trend } = props
  return h('div', { class: 'stat-box fade-up' }, [
    h('div', { class: 'stat-glow', style: { '--c-dim': color + '15' } }),
    h('div', { class: 'stat-icon', style: { color: color } }, [
      h(icon, { size: 20 })
    ]),
    h('div', { class: 'stat-val' }, value),
    h('div', { class: 'stat-label' }, label),
    trend ? h('div', { 
      class: 'stat-trend ' + (trend > 0 ? 'up' : 'down'),
      style: { fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }
    }, (trend > 0 ? '+' : '') + trend + '%') : null
  ])
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const barWidth = (val, total) => total > 0 ? (val / total) * 100 : 0
const needBarWidth = (n) => {
  const max = n.name === 'Water' ? totalMembers.value * 3 : totalMembers.value
  return max > 0 ? (n.total / max) * 100 : 0
}

const statColor = s => ({
  pending: 'var(--color-warn)',
  approved: 'var(--color-accent)',
  distributed: 'var(--color-success)',
  rejected: 'var(--color-danger)',
  'in-transit': 'var(--color-accent)',
  dispatched: 'var(--color-warn)',
  delivered: 'var(--color-success)',
  'At Home': 'var(--color-success)',
  'Evacuated': 'var(--color-warn)',
  'Missing': 'var(--color-danger)',
  'Relocated': 'var(--color-accent)'
})[s] || 'var(--text-secondary)'

const badgeStyle = s => ({ 
  background: `color-mix(in srgb, ${statColor(s)}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${statColor(s)}, transparent 70%)`, 
  color: statColor(s), 
  fontSize:'10px', padding:'2px 8px', borderRadius:'2px', fontFamily:'monospace' 
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');

/* ── Tokens ── */
/* Colors inherited from global style.css */

/* ── Animations ── */
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.fade-up { animation: fadeUp .4s ease forwards; }
.float   { animation: float 3s ease-in-out infinite; }

/* ── Hero ── */
.hero-banner { 
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-warn), transparent 91%), color-mix(in srgb, var(--color-success), transparent 96%)); 
  border: 1px solid color-mix(in srgb, var(--color-warn), transparent 80%); 
  border-radius: 10px; padding: 1.5rem 2rem; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; 
}
.hero-icon   { font-size: 40px; }
.hero-text   { flex: 1; }
.portal-label{ font-size: 11px; color: var(--color-warn); font-family: monospace; letter-spacing: .1em; margin-bottom: 4px; }
.hero-title  { font-size: 20px; font-weight: 900; margin-bottom: 4px; color: var(--text-primary); }
.hero-sub    { font-size: 13px; color: var(--text-secondary); }
.hero-actions{ display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Buttons ── */
.btn-primary { background: var(--color-warn); color: var(--bg-body); border: none; border-radius: 6px; padding: 9px 20px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: opacity .2s; font-family: 'Outfit', sans-serif; }
.btn-primary:hover { opacity: .8; }
.btn-primary.sm   { font-size: 11px; padding: 6px 14px; }
.btn-primary.full-w { width: 100%; justify-content: center; }
.btn-outline { background: transparent; border: 1px solid var(--color-warn); color: var(--color-warn); border-radius: 6px; padding: 9px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .2s; font-family: 'Outfit', sans-serif; }
.btn-outline:hover { opacity: .8; }
.link-btn    { background: none; border: none; color: var(--text-secondary); font-size: 11px; cursor: pointer; text-decoration: underline; }

/* ── Grids ── */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.two-col   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.three-col { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 16px; }

/* ── Cards ── */
.card         { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; }
.card-header  { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; color: var(--color-warn); margin-bottom: 14px; }
.card-title   { font-size: 13px; font-weight: 700; color: var(--color-warn); margin-bottom: 14px; }
.card-title.red   { color: var(--color-danger); }
.card-title.green { color: var(--color-success); }

/* ── Stat Box ── */
.stat-box   { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.2rem; position: relative; overflow: hidden; }
.stat-glow  { position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: var(--c-dim, var(--color-warn-dim)); border-radius: 0 8px 0 60px; }
.stat-icon  { font-size: 20px; margin-bottom: 8px; }
.stat-val   { font-size: 28px; font-weight: 900; line-height: 1; }
.stat-label { font-size: 11px; color: var(--text-secondary); font-family: monospace; letter-spacing: .06em; text-transform: uppercase; margin-top: 4px; }

/* ── Status rows ── */
.status-row   { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.status-icon  { font-size: 16px; width: 24px; text-align: center; }
.status-label { flex: 1; font-size: 13px; color: var(--text-primary); }
.status-val   { font-family: monospace; font-size: 14px; font-weight: 800; width: 20px; text-align: right; }
.row-footer   { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 12px; }

/* ── Bar ── */
.bar-wrap  { width: 80px; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 3px; transition: width .8s ease; }
.yellow-fill { background: var(--color-warn); }

/* ── Needs ── */
.need-row    { padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.need-top    { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.need-icon   { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.need-label  { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-primary); }
.need-total  { text-align: right; }
.need-unit   { font-size: 10px; color: var(--text-secondary); margin-left: 3px; }
.need-bar-row{ display: flex; align-items: center; gap: 8px; }
.need-bar-row .bar-wrap { flex: 1; width: auto; }
.need-meta   { font-size: 10px; color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; }

/* ── Vulnerable ── */
.vuln-list  { display: flex; flex-direction: column; gap: 8px; }
.vuln-row   { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; color: var(--text-primary); }

/* ── Family list ── */
.family-list { display: flex; flex-direction: column; gap: 8px; }
.family-row  { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: border-color .2s; }
.family-row:hover { border-color: color-mix(in srgb, var(--color-warn), transparent 66%); }
.family-icon { 
  width: 32px; height: 32px; border-radius: 8px; 
  background: color-mix(in srgb, var(--color-warn), transparent 91%); 
  border: 1px solid color-mix(in srgb, var(--color-warn), transparent 80%); 
  display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; 
}
.family-info { flex: 1; min-width: 0; }
.family-name { font-size: 13px; font-weight: 700; color: var(--color-warn); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.family-meta { font-size: 11px; color: var(--text-secondary); }

/* ── Report mini ── */
.report-mini-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.report-mini      { padding: 8px 10px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px; }
.report-mini-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.report-mini-type { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.report-mini-sub  { font-size: 11px; color: var(--text-secondary); }

/* ── Shared ── */
.mono   { font-family: monospace; }
.yellow { color: var(--color-warn); font-weight: 700; }
.red    { color: var(--color-danger); font-weight: 800; }
.green  { color: var(--color-success); }
.badge  { font-size: 10px; padding: 2px 8px; border-radius: 2px; font-family: monospace; }
.empty-sm { text-align: center; padding: 1.5rem; color: var(--text-secondary); font-size: 13px; display: flex; flex-direction: column; align-items: center; }
</style>