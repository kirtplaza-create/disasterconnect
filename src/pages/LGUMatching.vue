<template>
  <div class="fade-up">

    <!-- ── PAGE HEADER ── -->
    <div style="margin-bottom: 20px;">
      <div class="module-label">AI MODULE 03</div>
      <h1 class="page-title">AI Resource Matching</h1>
      <p class="page-sub">DisasterConnect AI optimizes resource allocation based on inventory levels and report severity</p>
    </div>

    <!-- ── TWO COLUMN LAYOUT ── -->
    <div class="two-col">

      <!-- ── LEFT: Selection & Inventory ── -->
      <div class="sidebar">
        <div class="card">
          <div class="card-title" style="margin-bottom: 12px;">Select Report</div>
          <select v-model="sel" class="field-select">
            <option v-for="r in reports" :key="r.id" :value="r.id">
              {{ r.id }} — {{ r.brgy }}
            </option>
          </select>

          <template v-if="report">
            <div class="divider" />
            <div class="section-label">Report Summary</div>
            <div v-for="[k, v] in reportSummaryRows" :key="k" class="kv-row">
              <span class="kv-key">{{ k }}</span>
              <span class="kv-val">{{ v }}</span>
            </div>

            <div v-if="!report.foodNeeded" class="needs-warning" style="display: flex; gap: 8px; align-items: flex-start;">
              <AlertTriangle :size="16" style="flex-shrink: 0;" />
              <span>Run Needs Assessment first for baseline data</span>
            </div>

            <button
              class="btn-primary"
              style="width: 100%; justify-content: center; margin-top: 16px;"
              :disabled="loading"
              @click="runMatching"
            >
              <span v-if="loading" style="display: flex; align-items: center; gap: 8px;"><Clock :size="16" class="spin-slow" /> Matching...</span>
              <span v-else style="display: flex; align-items: center; gap: 8px;"><Target :size="16" /> Run AI Matching</span>
            </button>
          </template>
        </div>

        <!-- Inventory Preview -->
        <div class="card" style="margin-top:16px;">
          <div class="card-title" style="margin-bottom: 12px;">Global Inventory</div>
          <div v-for="i in inventory" :key="i.id" style="margin-bottom: 12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span class="inv-item" :class="{ 'low': i.low }">{{ i.item }}</span>
              <span class="inv-qty" :class="{ 'low': i.low }">{{ (i.available || 0).toLocaleString() }}</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: getInvPct(i) + '%', background: i.low ? 'var(--color-danger)' : 'var(--color-success)' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT: AI Output ── -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div class="pulse-dot" style="background: var(--color-high);" />
          <div class="card-title">DisasterConnect AI Allocation Output</div>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading" class="ai-loader">
          <div class="spinner" style="border-top-color: var(--color-high);" />
          <span class="spinner-text">Optimizing distribution plan...</span>
        </div>

        <!-- Empty state -->
        <div v-else-if="!result" class="empty-state">
          <Target :size="64" class="empty-icon" />
          <div class="empty-text">Select a report and click Run AI Matching</div>
        </div>

        <!-- Error state -->
        <div v-else-if="result.error" style="color: var(--color-danger); padding: 1rem; font-size: 13px;">
          {{ result.error }}
        </div>

        <!-- ── RESULTS ── -->
        <div v-else class="fade-up">

          <!-- Matching Efficiency Stats -->
          <div class="score-grid">
            <div class="score-box" :style="{ background: 'color-mix(in srgb, var(--color-accent), transparent 93%)', border: '1px solid color-mix(in srgb, var(--color-accent), transparent 73%)' }">
              <div class="score-label">MATCH EFFICIENCY</div>
              <div class="score-value" style="color: var(--color-accent)">{{ result.matchEfficiencyScore }}%</div>
              <div class="score-sub">Resource Optimization</div>
              <div class="progress-bg">
                <div class="progress-fill" :style="{ width: result.matchEfficiencyScore + '%', background: 'var(--color-accent)' }" />
              </div>
            </div>
            <div class="score-box" :style="{ background: 'color-mix(in srgb, var(--color-high), transparent 93%)', border: '1px solid color-mix(in srgb, var(--color-high), transparent 73%)' }">
              <div class="score-label">SUPPLY READINESS</div>
              <div class="score-value" style="color: var(--color-high)">{{ result.resourceReadinessScore }}%</div>
              <div class="score-sub">Inventory Coverage</div>
              <div class="progress-bg">
                <div class="progress-fill" :style="{ width: result.resourceReadinessScore + '%', background: 'var(--color-high)' }" />
              </div>
            </div>
          </div>

          <!-- Match Status -->
          <div class="section-label">MATCH STATUS</div>
          <div style="font-size: 13px; margin-bottom: 12px; font-weight: 700;" :style="{ color: getStatusColor(result.matchStatus) }">
            {{ result.matchStatus }}
          </div>

          <div class="divider" />

          <!-- Allocation Strategy -->
          <div class="section-label">ALLOCATION STRATEGY</div>
          <div class="findings-text">{{ result.allocationStrategy }}</div>

          <div class="divider" />

          <!-- Distribution Table -->
          <div class="section-label">DETAILED ASSIGNMENTS</div>
          <div style="overflow-x: auto; margin-bottom: 16px;">
            <table class="matching-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Food</th>
                  <th>Water</th>
                  <th>Priority</th>
                  <th>Source Center</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in result.allocations" :key="i">
                  <td>{{ a.barangay }}</td>
                  <td class="mono green">{{ a.foodPacks }} pk</td>
                  <td class="mono green">{{ a.waterLiters }} L</td>
                  <td>
                    <span class="table-badge" :style="badgeStyle(a.priority)">{{ a.priority }}</span>
                  </td>
                  <td style="color: var(--text-secondary); font-size: 11px;">{{ a.source }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divider" />

          <!-- Partners Involved -->
          <div class="section-label">CONFIRMED PARTNERS / SOURCES</div>
          <div class="tags-row">
            <span v-for="p in result.partnersInvolved" :key="p" class="tag">{{ p }}</span>
          </div>

          <div class="divider" />

          <!-- Next Steps -->
          <div class="section-label">LOGISTICAL CLASSIFICATION & STEPS</div>
          <div v-for="(s, i) in result.nextSteps" :key="i" class="action-row">
            <span class="action-num">{{ i + 1 }}.</span>
            <span>{{ s }}</span>
          </div>

          <div class="divider" />

          <!-- Gaps Identified -->
          <div class="section-label">REMAINING GAPS & DEFICITS</div>
          <div v-for="(g, i) in result.gapsIdentified" :key="i" class="risk-row">
            <AlertTriangle :size="14" class="risk-icon" />
            <span>{{ g }}</span>
          </div>

          <!-- Approval Area -->
          <div v-if="report && report.status !== 'approved_match'" class="approval-area">
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; font-style: italic;">Authorize matching results for distribution.</p>
            <button class="btn-approve" @click="approveMatch" :disabled="approving" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle v-if="!approving" :size="18" />
              {{ approving ? 'Approving...' : 'Approve & Finalize Allocation' }}
            </button>
          </div>
          <div v-else-if="report && report.status === 'approved_match'" class="approval-area success">
            <div style="color: var(--color-success); font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle :size="16" /> Allocation Finalized
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { askAI, parseAIJSON } from '../services/aiService'
import { AlertTriangle, Clock, Target, CheckCircle } from 'lucide-vue-next'

// ─── PROPS & EMITS ────────────────────────────────────────────────────────────
const props = defineProps({
  reports: { type: Array, required: true },
  inventory: { type: Array, required: true },
})
const emit = defineEmits(['update:reports'])

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getStatusColor = (s) => ({ Optimized: 'var(--color-success)', Partial: 'var(--color-warn)', 'Critical Gap': 'var(--color-danger)' })[s] || 'var(--text-secondary)'
const getInvPct = (i) => i.low ? 20 : Math.min(((i.available || 0) / 1000) * 100, 100)
const sevColor = (s) => ({ Critical: 'var(--color-danger)', High: 'var(--color-high)', Moderate: 'var(--color-warn)', Low: 'var(--color-success)' })[s] || 'var(--text-secondary)'
const badgeStyle = (s) => ({ 
  background: `color-mix(in srgb, ${sevColor(s)}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${sevColor(s)}, transparent 70%)`, 
  color: sevColor(s) 
})

// ─── STATE ────────────────────────────────────────────────────────────────────
const sel       = ref(props.reports[0]?.id || null)
const loading   = ref(false)
const approving = ref(false)
const result    = ref(null)

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const report = computed(() => props.reports.find(r => r.id === sel.value))

const reportSummaryRows = computed(() => {
  if (!report.value) return []
  const r = report.value
  return [
    ['Families',      r.families],
    ['Individuals',   r.individuals],
    ['Severity',      r.severity || 'Pending'],
    ['Food Needed',   r.foodNeeded ? `${r.foodNeeded} pk` : '—'],
    ['Water Needed',  r.waterNeeded ? `${r.waterNeeded} L` : '—'],
  ]
})

// ─── RUN MATCHING ─────────────────────────────────────────────────────────────
async function runMatching() {
  if (!report.value || loading.value) return
  loading.value = true
  result.value  = null

  const r = report.value
  const invStr = props.inventory.map(i => `${i.item}: ${i.available}`).join('; ')
  
  const system = `You are a Logistics Optimizer. Respond ONLY with a MINIFIED JSON object. No commentary, no text before/after.
Ensure the allocationStrategy field is DETAILED, ANALYTICAL, and EXPOUNDED (3-5 professional sentences).`
  const prompt = `Match resources for this Philippine disaster.
Barangay: ${r.brgy}
Needs: ${r.foodNeeded} food packs, ${r.waterNeeded}L water.
Inventory Available: ${invStr}

JSON Structure:
{
  "matchStatus": "Optimized|Partial|Critical Gap",
  "matchEfficiencyScore": number,
  "resourceReadinessScore": number,
  "allocationStrategy": "Detailed 3-5 sentence explanation of the logistics flow and why these sources were selected",
  "partnersInvolved": ["string"],
  "nextSteps": ["string"],
  "gapsIdentified": ["string"],
  "allocations": [
    { "barangay": "${r.brgy}", "foodPacks": number, "waterLiters": number, "priority": "Low|Moderate|High|Critical", "source": "Warehouse Name" }
  ]
}

CRITICAL: Do not be brief. Explain the optimization logic.`

  try {
    const raw = await askAI(system, prompt)
    const parsed = parseAIJSON(raw)
    
    // OPTIMISTIC UI
    result.value = parsed
    loading.value = false

    // DATA SYNC
    const update = { allocation: parsed, matchStatus: parsed.matchStatus }
    
    // Background DB Update
    updateDoc(doc(db, 'reports', sel.value), update)
      .then(() => console.log("✅ Match Synced"))
      .catch(err => console.error("❌ Match Sync Error:", err))

  } catch (e) {
    console.error(e)
    result.value = { error: `AI Matching Failed: ${e.message}` }
    loading.value = false
  }
}

async function approveMatch() {
  if (!report.value || !result.value) return
  approving.value = true
  try {
    await updateDoc(doc(db, 'reports', sel.value), {
      status: 'approved_match',
      matchApprovedAt: new Date().toISOString()
    })
  } catch (e) {
    console.error(e)
  }
  approving.value = false
}
</script>


<style scoped>
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin   { to { transform: rotate(360deg); } }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
.spin-slow { animation: spin 3s linear infinite; }
.fade-up { animation: fadeUp 0.4s ease forwards; }

.module-label { font-size:10px; color:var(--color-accent); font-family:'DM Mono',monospace; letter-spacing:0.12em; margin-bottom:4px; }
.page-title   { font-size:22px; font-weight:800; }
.page-sub     { color:var(--text-secondary); font-size:13px; margin-top:4px; }

.two-col { display:grid; grid-template-columns:300px 1fr; gap:16px; }

.card      { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:6px; padding:1.25rem; }
.card-title{ font-size:14px; font-weight:700; }

.field-select {
  width:100%; background:var(--bg-body); border:1px solid var(--border-color);
  border-radius:4px; padding:8px 12px; color:var(--text-primary);
  font-size:13px; appearance:none; cursor:pointer;
  font-family:'Outfit',sans-serif; outline:none; transition:border-color .2s;
}
.field-select:focus { border-color:var(--color-accent); }

.divider { height:1px; background:var(--border-color); margin:1rem 0; }
.section-label { font-size:11px; color:var(--text-secondary); font-family:'DM Mono',monospace; text-transform:uppercase; margin-bottom:8px; }

.kv-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border-color); }
.kv-key { font-size:12px; color:var(--text-secondary); }
.kv-val { font-size:12px; font-family:'DM Mono',monospace; color:var(--text-primary); }

.inv-item { font-size: 12px; color: var(--text-primary); }
.inv-item.low { color: var(--color-danger); }
.inv-qty { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--color-accent); }
.inv-qty.low { color: var(--color-danger); }

.btn-primary {
  background:var(--color-accent); color:var(--bg-body); border:none; border-radius:4px;
  padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer;
  transition:opacity .2s; display:inline-flex; align-items:center;
  gap:6px; font-family:'Outfit',sans-serif;
}
.btn-primary:hover    { opacity:0.85; }
.btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

.pulse-dot { width:8px; height:8px; border-radius:50%; animation:pulse 1.8s ease-in-out infinite; flex-shrink:0; }
.ai-loader    { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:3rem 0; }
.spinner      { width:36px; height:36px; border:2px solid var(--border-color); border-radius:50%; animation:spin 1s linear infinite; }
.spinner-text { font-family:'DM Mono',monospace; font-size:12px; color:var(--text-secondary); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 1rem; color: var(--text-secondary); text-align: center; }
.empty-icon  { margin-bottom: 16px; color: var(--border-color); stroke-width: 1.5; }
.empty-text  { font-size: 14px; font-weight: 500; max-width: 240px; line-height: 1.5; }

.score-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.score-box  { border-radius:6px; padding:12px 16px; text-align:center; }
.score-label{ font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; margin-bottom:4px; }
.score-value{ font-size:20px; font-weight:800; line-height:1; margin-bottom:2px; }
.score-sub  { font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; margin-bottom:6px; }
.progress-bg  { height:4px; background:var(--border-color); border-radius:2px; overflow:hidden; margin-top:4px; }
.progress-fill{ height:100%; border-radius:2px; transition:width .8s ease; }

.findings-text { font-size:13px; color:var(--text-primary); line-height:1.7; margin-bottom:12px; }

.matching-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.matching-table th { text-align: left; padding: 8px; font-size: 11px; color: var(--text-secondary); font-family: 'DM Mono', monospace; font-weight: 400; border-bottom: 1px solid var(--border-color); }
.matching-table td { padding: 10px 8px; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.mono { font-family: 'DM Mono', monospace; }
.green { color: var(--color-success); }
.table-badge { padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 600; font-family: 'DM Mono', monospace; }

.tags-row { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
.tag {
  display:inline-block; padding:2px 10px;
  background:color-mix(in srgb, var(--color-accent), transparent 90%); border:1px solid color-mix(in srgb, var(--color-accent), transparent 70%);
  color:var(--color-accent); font-size:11px; font-family:'DM Mono',monospace;
  border-radius:2px; font-weight:500;
}

.action-row { display:flex; gap:8px; margin-bottom:6px; font-size:12px; color:var(--text-primary); }
.action-num { color:var(--color-accent); font-family:'DM Mono',monospace; flex-shrink:0; }
.risk-row  { display:flex; gap:8px; margin-bottom:5px; font-size:12px; color:var(--text-primary); }
.risk-icon { color:var(--color-danger); flex-shrink:0; }

.needs-warning { margin-top:12px; padding:10px; background:color-mix(in srgb, var(--color-danger), transparent 93%); border:1px solid color-mix(in srgb, var(--color-danger), transparent 80%); border-radius:4px; font-size:12px; color:var(--color-danger); line-height:1.4; }

.approval-area { margin-top: 20px; padding: 1.5rem; background: var(--bg-body); border: 1px dashed var(--border-color); border-radius: 8px; text-align: center; }
.approval-area.success { border: 1px solid color-mix(in srgb, var(--color-success), transparent 80%); background: color-mix(in srgb, var(--color-success), transparent 97%); }
.btn-approve { background: var(--color-success); color: var(--bg-body); border: none; border-radius: 4px; padding: 12px 24px; font-size: 14px; font-weight: 800; cursor: pointer; width: 100%; transition: opacity 0.2s; }
.btn-approve:disabled { opacity:0.5; }
</style>
