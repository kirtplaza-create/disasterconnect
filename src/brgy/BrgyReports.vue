<template>
  <div class="fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Reports</h1>
        <p class="page-sub">All disaster reports submitted by Barangay Riverside</p>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="reports.length === 0" class="empty-state">
      <div style="margin-bottom:12px"><ClipboardList :size="40" color="var(--text-dim)" /></div>
      <div class="empty-title">No reports filed yet</div>
      <div class="empty-sub">Submit a disaster report when a calamity occurs.</div>
    </div>

    <!-- Reports List -->
    <div v-else class="reports-list">
      <div v-for="r in reports" :key="r.id" class="report-card" :style="{ borderLeft: `3px solid ${sevColor(r.severity)}` }">
        <div class="report-top">
          <span class="report-type">{{ r.dtype }}</span>
          <span class="badge" :style="sevBadge(r.severity)">{{ r.severity }}</span>
          <span class="badge" :style="statBadge(r.status)">{{ (r.status || 'pending').toUpperCase() }}</span>
          <span class="report-id">{{ r.id }} · {{ r.date }}</span>
        </div>
        <div class="report-desc">{{ r.desc }}</div>
        
        <!-- LGU Feedback / AI Analysis -->
        <div v-if="r.aiAnalysis" class="lgu-feedback fade-up">
          <div class="feedback-header">
            <span class="ai-chip">AI ANALYZED</span>
            <span class="feedback-title">LGU Analysis Findings</span>
          </div>
          <div class="findings">
            {{ typeof r.aiAnalysis.keyFindings === 'string' ? r.aiAnalysis.keyFindings : (r.aiAnalysis.keyFindings?.disproportionateImpact || 'Incident analysis complete and processed.') }}
          </div>
          <div class="needs-tags">
            <span v-for="need in r.aiAnalysis.priorityNeeds" :key="need" class="need-tag">
              <Zap :size="10" style="display:inline; margin-right:4px;" /> {{ need }}
            </span>
          </div>
          <div class="vulnerability">
             Priority Score: <span class="score" :style="{ color: sevColor(r.severity) }">{{ r.severityScore || 0 }}%</span>
          </div>
        </div>

        <div class="report-meta">
          <span v-for="row in metaRows(r)" :key="row.label" class="meta-item">
            <component :is="row.icon" :size="12" style="display:inline; margin-right:4px;" /> <span class="meta-val">{{ row.val }}</span> {{ row.label }}
          </span>
        </div>

        <!-- Supply needs if available -->
        <div v-if="r.foodNeeded || r.waterNeeded || r.medNeeded || r.blanketNeeded" class="supply-row">
          <span v-if="r.foodNeeded"    class="supply-chip food"><Box :size="10" /> {{ r.foodNeeded }} packs</span>
          <span v-if="r.waterNeeded"   class="supply-chip water"><Droplet :size="10" /> {{ r.waterNeeded }}L</span>
          <span v-if="r.medNeeded"     class="supply-chip med"><Stethoscope :size="10" /> {{ r.medNeeded }} kits</span>
          <span v-if="r.blanketNeeded" class="supply-chip blanket"><Bed :size="10" /> {{ r.blanketNeeded }} pcs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ClipboardList, 
  Zap, 
  Users, 
  Footprints, 
  Activity, 
  User, 
  Smile, 
  Box, 
  Droplet, 
  Stethoscope, 
  Bed 
} from 'lucide-vue-next'
defineProps({
  reports: { type: Array, default: () => [] }
})

const sevColor = s => ({ Critical:'var(--color-danger)', High:'var(--color-warn)', Moderate:'var(--color-warn)', Low:'var(--color-success)' })[s] || 'var(--text-secondary)'
const statColor = s => ({ pending:'var(--color-warn)', approved:'var(--color-accent)', distributed:'var(--color-success)', rejected:'var(--color-danger)', 'in-transit':'var(--color-accent)', dispatched:'var(--color-warn)', delivered:'var(--color-success)' })[s] || 'var(--text-secondary)'

const sevBadge  = s => { 
  const c = sevColor(s);  
  return { 
    background: `color-mix(in srgb, ${c}, transparent 90%)`, 
    border: `1px solid color-mix(in srgb, ${c}, transparent 70%)`, 
    color: c, 
    fontSize: '10px', padding: '2px 8px', borderRadius: '2px', fontFamily: 'monospace' 
  } 
}
const statBadge = s => { 
  const c = statColor(s); 
  return { 
    background: `color-mix(in srgb, ${c}, transparent 90%)`, 
    border: `1px solid color-mix(in srgb, ${c}, transparent 70%)`, 
    color: c, 
    fontSize: '10px', padding: '2px 8px', borderRadius: '2px', fontFamily: 'monospace' 
  } 
}

const metaRows = r => [
  { icon: Users,      val: r.families,    label: 'families' },
  { icon: Users,      val: r.individuals, label: 'individuals' },
  { icon: Footprints, val: r.evacuees,    label: 'evacuees' },
  { icon: Activity,   val: r.injured,     label: 'injured' },
  { icon: User,       val: r.elderly,     label: 'elderly' },
  { icon: Smile,      val: r.children,    label: 'children' },
].filter(row => row.val > 0)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
*{box-sizing:border-box;font-family:'Outfit','Segoe UI',sans-serif}

.page-header{margin-bottom:20px}
.page-title{font-size:22px;font-weight:900;color:var(--text-primary)}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px}
.empty-state{text-align:center;padding:5rem;color:var(--text-secondary);display:flex;flex-direction:column;align-items:center}
.empty-title{font-size:15px;font-weight:700;margin-bottom:6px;color:var(--text-primary)}
.empty-sub{font-size:13px}
.reports-list{display:flex;flex-direction:column;gap:10px}
.report-card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.25rem;transition:all .2s}
.report-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.report-type{font-size:14px;font-weight:800;color:var(--text-primary)}
.report-id{font-size:11px;color:var(--text-secondary);font-family:monospace;margin-left:auto}
.report-desc{font-size:12px;color:var(--text-secondary);margin-bottom:10px;line-height:1.6}
.report-meta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.meta-item{font-size:12px;color:var(--text-secondary)}
.meta-val{color:var(--color-warn);font-weight:700}
.supply-row{display:flex;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border-color);margin-top:8px}
.supply-chip{font-size:11px;padding:3px 10px;border-radius:3px;font-family:monospace}
.supply-chip.food{background:color-mix(in srgb, var(--color-warn), transparent 91%);border:1px solid color-mix(in srgb, var(--color-warn), transparent 73%);color:var(--color-warn)}
.supply-chip.water{background:color-mix(in srgb, var(--color-accent), transparent 91%);border:1px solid color-mix(in srgb, var(--color-accent), transparent 73%);color:var(--color-accent)}
.supply-chip.med{background:color-mix(in srgb, var(--color-danger), transparent 91%);border:1px solid color-mix(in srgb, var(--color-danger), transparent 73%);color:var(--color-danger)}
.supply-chip.blanket{background:color-mix(in srgb, var(--color-success), transparent 91%);border:1px solid color-mix(in srgb, var(--color-success), transparent 73%);color:var(--color-success)}
.badge{font-family:monospace;font-size:10px;padding:2px 8px;border-radius:2px;display:inline-block}

/* ── LGU FEEDBACK ── */
.lgu-feedback {
  background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px;
  padding: 12px; margin-bottom: 12px;
}
.feedback-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ai-chip { font-size: 8px; font-family: monospace; background: color-mix(in srgb, var(--color-accent), transparent 87%); color: var(--color-accent); border: 1px solid color-mix(in srgb, var(--color-accent), transparent 73%); padding: 1px 5px; border-radius: 2px; }
.feedback-title { font-size: 11px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.04em; }
.findings { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; font-style: italic; }
.needs-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.need-tag { background: color-mix(in srgb, var(--color-warn), transparent 91%); border: 1px solid color-mix(in srgb, var(--color-warn), transparent 73%); color: var(--color-warn); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
.vulnerability { font-size: 11px; color: var(--text-secondary); }
.score { font-weight: 800; font-family: monospace; }
</style>