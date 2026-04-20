<template>
  <div class="fade-up">

    <!-- ── PAGE HEADER ── -->
    <div style="margin-bottom: 20px;">
      <div class="module-label">AI MODULE 02</div>
      <h1 class="page-title">AI Needs Assessment</h1>
      <p class="page-sub">DisasterConnect AI adjusts relief requirements based on vulnerability, report severity, and situation context</p>
    </div>

    <!-- ── TWO COLUMN LAYOUT ── -->
    <div class="two-col">

      <!-- ── LEFT: Selection & Baseline ── -->
      <div class="sidebar">
        <div class="card">
          <div class="card-title" style="margin-bottom: 12px;">Select Report</div>
          <select v-model="sel" class="field-select">
            <option v-for="r in reports" :key="r.id" :value="r.id">
              [{{ (r.status || 'pending').toUpperCase() }}] {{ r.id }} - {{ r.brgy }}
            </option>
          </select>

          <template v-if="report">
            <div class="divider" />
            
            <div class="section-label" style="margin-bottom: 12px;">BASELINE SYSTEM CALCULATION</div>
            
            <div class="baseline-card">
              <div class="formula-text">Formula: 1 food pack + 3L water per person/day</div>
              
              <div class="baseline-row">
                <span>Individuals</span>
                <span class="v-blue">{{ report.individuals }}</span>
              </div>
              <div class="baseline-row">
                <span>Base Food Packs</span>
                <span class="v-blue">{{ baseFood }} packs</span>
              </div>
              <div class="baseline-row">
                <span>Base Water</span>
                <span class="v-blue">{{ baseWater.toLocaleString() }} liters</span>
              </div>
              <div class="baseline-row">
                <span>Base Med Kits</span>
                <span class="v-blue">{{ baseMed }} kits</span>
              </div>
              <div class="baseline-row">
                <span>Elderly</span>
                <span class="v-blue">{{ report.elderly }}</span>
              </div>
              <div class="baseline-row" style="border-bottom: none;">
                <span>Children</span>
                <span class="v-blue">{{ report.children }}</span>
              </div>
            </div>

            <div class="img-warning-box" style="display: flex; gap: 10px; align-items: flex-start;">
              <AlertTriangle :size="16" style="flex-shrink: 0; margin-top: 2px;" />
              <span>Baseline only — AI adjustment may increase these values based on severity and vulnerability.</span>
            </div>

            <button
              class="btn-run-ai"
              :disabled="loading"
              @click="runAssessment"
            >
              <BarChart3 :size="16" /> {{ loading ? 'Assessing...' : 'Run AI Assessment' }}
            </button>
          </template>
        </div>
      </div>

      <!-- ── RIGHT: AI Output ── -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div class="pulse-dot" style="background: #00E5A0;" />
          <div class="card-title">DisasterConnect AI Assessment Output</div>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading" class="ai-loader">
          <div class="spinner" style="border-top-color: #00E5A0;" />
          <span class="spinner-text">Analyzing vulnerabilities...</span>
        </div>

        <!-- Empty state -->
        <div v-else-if="!result" class="empty-state">
          <BarChart3 :size="64" class="empty-icon" />
          <div class="empty-text">Select a report and click Run AI Assessment</div>
        </div>

        <!-- Error state -->
        <div v-else-if="result.error" style="color: #FF3B5C; padding: 1rem; font-size: 13px;">
          {{ result.error }}
        </div>

        <!-- ── RESULTS ── -->
        <div v-else class="fade-up">

          <!-- Scoring Grid (Duration & Budget) -->
          <div class="score-grid">
            <div class="score-box" :style="{ background: '#00D4FF12', border: '1px solid #00D4FF44' }">
              <div class="score-label">ESTIMATED DURATION</div>
              <div class="score-value" style="color: #00D4FF; font-size: 24px;">{{ result.durationDays }} Days</div>
              <div class="score-sub">Resource Coverage Period</div>
            </div>
            <div class="score-box" :style="{ background: '#FFD23F12', border: '1px solid #FFD23F44' }">
              <div class="score-label">BUDGET ESTIMATE</div>
              <div class="score-value" style="color: #FFD23F; font-size: 18px; line-height: 1.2; word-break: break-all;">
                {{ result.totalBudgetEstimate }}
              </div>
              <div class="score-sub">Total Funding Required</div>
            </div>
          </div>

          <!-- Vulnerability Note -->
          <div class="section-label">VULNERABILITY ASSESSMENT</div>
          <div class="vuln-box-large">
             <div style="display: flex; gap: 10px;">
                <AlertTriangle :size="20" />
                <span>{{ result.vulnerabilityNote }}</span>
             </div>
          </div>

          <div class="divider" />
          
          <!-- Key Findings (Expounded) -->
          <div class="section-label">EXECUTIVE SUMMARY</div>
          <div class="findings-text">{{ result.adjustmentReason }}</div>

          <div class="divider" />
          
          <!-- New: Budget Breakdown -->
          <template v-if="result.budgetBreakdown">
            <div class="section-label">FINANCIAL LOGIC & CONTEXT</div>
            <div class="budget-reasoning-box">
              <div class="reason-key" style="color: #FFD23F;">Budget Derivation</div>
              <div class="reason-val" style="color: #E2EAF4;">{{ result.budgetBreakdown }}</div>
            </div>
            <div class="divider" />
          </template>

          <div class="section-label">DETAILED REASONING BY CATEGORY</div>
          <div class="reasoning-grid">
             <div v-if="result.reasoning?.food" class="reason-item">
                <div class="reason-key">Food Adjustment</div>
                <div class="reason-val">{{ result.reasoning.food }}</div>
             </div>
             <div v-if="result.reasoning?.water" class="reason-item">
                <div class="reason-key">Water Adjustment</div>
                <div class="reason-val">{{ result.reasoning.water }}</div>
             </div>
             <div v-if="result.reasoning?.medical" class="reason-item">
                <div class="reason-key">Medical & Health Logic</div>
                <div class="reason-val">{{ result.reasoning.medical }}</div>
             </div>
             <div v-if="result.hygieneKits" class="reason-item">
                <div class="reason-key">Sanitation & Hygiene</div>
                <div class="reason-val">Requirement of {{ result.hygieneKits }} kits based on 1 kit per family and vulnerability multipliers.</div>
             </div>
             <div v-if="result.reasoning?.other" class="reason-item">
                <div class="reason-key">Shelter & Logistics (Blankets/Tents)</div>
                <div class="reason-val">{{ result.reasoning.other }}</div>
             </div>
          </div>

          <!-- Comparison Table -->
          <div class="section-label">BASELINE VS AI-ADJUSTED REQUIREMENTS</div>
          <div style="overflow-x: auto; margin-bottom: 16px;">
            <table class="matching-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Baseline</th>
                  <th>AI Adjusted</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.label">
                  <td>{{ row.label }}</td>
                  <td class="mono" style="color: #4A6080;">{{ typeof row.base === 'number' ? row.base.toLocaleString() : row.base }}</td>
                  <td class="mono green" style="font-weight: 700; font-size: 14px;">{{ (row.adj || 0).toLocaleString() }}</td>
                  <td>
                    <span v-if="typeof row.base === 'number' && row.adj > row.base" class="diff-chip plus">
                      +{{ (row.adj - row.base).toLocaleString() }}
                    </span>
                    <span v-else-if="typeof row.base === 'number' && row.adj < row.base" class="diff-chip minus">
                      {{ (row.adj - row.base).toLocaleString() }}
                    </span>
                    <span v-else style="color: #4A6080;">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divider" />

          <!-- Priority Items -->
          <div class="section-label">SCENARIO-SPECIFIC PRIORITY ITEMS</div>
          <div class="tags-row">
            <span v-for="p in result.priorityItems" :key="p" class="tag green-mono">{{ p }}</span>
          </div>

          <!-- Approval Area -->
          <div v-if="report && report.needsStatus !== 'approved'" class="approval-area">
            <p style="font-size: 12px; color: #4A6080; margin-bottom: 12px; font-style: italic;">Finalize these requirements for resource matching.</p>
            <button class="btn-approve" @click="approveNeeds" :disabled="approving" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle v-if="!approving" :size="18" />
              {{ approving ? 'Approving...' : 'Approve & Finalize Needs' }}
            </button>
          </div>
          <div v-else-if="report && report.needsStatus === 'approved'" class="approval-area success">
            <div style="color: #00E5A0; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle :size="16" /> Assessment Finalized (NDRRMC Compliant)
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
import { AlertTriangle, BarChart3, CheckCircle } from 'lucide-vue-next'

// ─── PROPS & EMITS ────────────────────────────────────────────────────────────
const props = defineProps({
  reports: { type: Array, required: true },
})
const emit = defineEmits(['update:reports'])

// ─── STATE ────────────────────────────────────────────────────────────────────
const sel       = ref(props.reports[0]?.id || null)
const loading   = ref(false)
const approving = ref(false)
const result    = ref(null)

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const report = computed(() => props.reports.find(r => r.id === sel.value))

const baseFood = computed(() => (report.value?.individuals || 0) * 3) // 1 pack per person per day for 3 days
const baseWater = computed(() => (report.value?.individuals || 0) * 3 * 3) // 3L per person per day for 3 days
const baseMed = computed(() => {
  const r = report.value
  if (!r) return 0
  return Math.ceil((r.injured || 0) * 1.5) || Math.ceil(r.individuals * 0.05)
})

const comparisonRows = computed(() => {
  if (!result.value) return []
  return [
    { label: 'Food Packs',   base: baseFood.value,  adj: result.value.foodPacks },
    { label: 'Water (L)',    base: baseWater.value, adj: result.value.waterLiters },
    { label: 'Medical Kits', base: baseMed.value,   adj: result.value.medicalKits },
    { label: 'Hygiene Kits', base: baseHygiene.value, adj: result.value.hygieneKits },
    { label: 'Blankets',     base: 0,               adj: result.value.blankets },
    { label: 'Tents',        base: 0,               adj: result.value.tents },
  ]
})

const baseHygiene = computed(() => Math.ceil((report.value?.individuals || 0) / 5))

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const UNIT_COSTS = {
  food: 150,
  water: 15,
  med: 2500,
  hygiene: 450,
  blanket: 350,
  tent: 4500
}

// ─── RUN ASSESSMENT ───────────────────────────────────────────────────────────
async function runAssessment() {
  if (!report.value || loading.value) return
  loading.value = true
  result.value  = null

  const r = report.value
  const duration = 3
  const sphereWater = r.individuals * 15 * duration
  const sphereFood = r.individuals * 3 * duration
  const sphereMeds = Math.ceil(r.individuals / 50)
  const sphereBlankets = r.individuals
  const sphereTents = Math.ceil(r.individuals / 5)

  const systemInstructions = `You are DisasterConnect, an expert NDRRMC relief accountant. 
  Respond ONLY with a MINIFIED JSON object. No commentary. 
  All reasoning and budget summaries must be GROUNDED and EXPOUNDED (3-5 professional sentences).`

  const systemPrompt = `Analyze relief requirements for Barangay ${r.brgy}.
  
  ## NDRRMC & SPHERE CALCULATION RULES:
  1. DRINKING WATER: 15L per family per day.
  2. HYGIENE WATER: 5L per person per day.
  3. FOOD: 1 pack per family per day.
  4. HYGIENE KITS: 1 kit per family.
  5. DURATION: ${duration} days.

  ## MANDATORY RULES
  1. Use SINGLE QUOTES inside your sentences. Never use double quotes inside a string.
  2. Ensure the JSON is valid and minified.
  3. All reasoning must be detailed (3-5 sentences).

  ## VULNERABILITY MULTIPLIERS:
  - If Elderly > 40%: Add 20% to Food/Water.
  - If Children > 20%: Add 15% to Hygiene Water/Kits.
  - If Injured > 10%: Add 50% to Med Kits.
  - If Infra Damage is 'High': Add 30% to Tents.

  ## MANDATORY JSON STRUCTURE:
  {
    "foodPacks": number,
    "waterLiters": number,
    "medicalKits": number,
    "hygieneKits": number,
    "blankets": number,
    "tents": number,
    "adjustmentReason": "string (Executive summary of how vulnerability shifted the baseline)",
    "budgetBreakdown": "string (Detailed derivation text explaining total cost calculation)",
    "reasoning": { 
      "food": "string", 
      "water": "string", 
      "medical": "string", 
      "other": "string" 
    },
    "vulnerabilityNote": "string (Identifying specific high-risk groups found in report)",
    "priorityItems": ["item1", "item2"],
    "durationDays": ${duration}
  }`

  const prompt = `Calculate immediate relief for Barangay ${r.brgy}.
  Total Population: ${r.individuals} people (${r.families} families).
  Vulnerability: ${r.elderly} elderly, ${r.children} children, ${r.evacuees} evacuees, ${r.injured} injured.`

  try {
    const raw = await askAI(systemInstructions, systemPrompt + "\n\n" + prompt)
    const parsed = parseAIJSON(raw)
    
    // SAFETY RAILS
    const safeFood = Number(parsed.foodPacks || 0)
    const safeWater = Number(parsed.waterLiters || 0)
    const safeMeds = Number(parsed.medicalKits || 0)
    const safeHygiene = Number(parsed.hygieneKits || 0)
    const safeBlankets = Number(parsed.blankets || 0)
    const safeTents = Number(parsed.tents || 0)

    // CALCULATE BUDGET IN CODE (100% Reliable)
    const totalCost = 
      (safeFood * UNIT_COSTS.food) +
      (safeWater * UNIT_COSTS.water) + 
      (safeMeds * UNIT_COSTS.med) +
      (safeHygiene * UNIT_COSTS.hygiene) +
      (safeBlankets * UNIT_COSTS.blanket) +
      (safeTents * UNIT_COSTS.tent)

    const finalResult = {
      ...parsed,
      foodPacks: safeFood,
      waterLiters: safeWater,
      medicalKits: safeMeds,
      hygieneKits: safeHygiene,
      blankets: safeBlankets,
      tents: safeTents,
      totalBudgetEstimate: `₱ ${totalCost.toLocaleString()}`
    }

    // OPTIMISTIC UI
    result.value = finalResult
    loading.value = false

    // PERSISTENCE DATA
    const update = {
      foodNeeded: safeFood,
      waterNeeded: safeWater,
      medNeeded: safeMeds,
      needsAssessment: finalResult,
      needsStatus: 'pending_approval'
    }

    // Background Sync
    updateDoc(doc(db, 'reports', sel.value), update)
      .then(() => console.log("✅ Needs Grounded & Budget Calculated"))
      .catch(err => console.error("❌ Sync Error:", err))

  } catch (e) {
    console.error(e)
    result.value = { error: `AI Assessment Failed: ${e.message}` }
    loading.value = false
  }
}

async function approveNeeds() {
  if (!report.value || !result.value) return
  approving.value = true
  try {
    const update = {
      needsStatus: 'approved',
      needsApprovedAt: new Date().toISOString()
    }
    await updateDoc(doc(db, 'reports', sel.value), update)
    emit('update:reports', props.reports.map(rep =>
      rep.id === sel.value ? { ...rep, ...update } : rep
    ))
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
.fade-up { animation: fadeUp 0.4s ease forwards; }

.module-label { font-size:10px; color:#00D4FF; font-family:'DM Mono',monospace; letter-spacing:0.12em; margin-bottom:4px; }
.page-title   { font-size:22px; font-weight:800; }
.page-sub     { color:#4A6080; font-size:13px; margin-top:4px; }

.two-col { display:grid; grid-template-columns:400px 1fr; gap:16px; }

.sidebar { display: flex; flex-direction: column; gap: 16px; }

.card      { background:#0D1219; border:1px solid #1A2535; border-radius:6px; padding:1.25rem; }
.card-title{ font-size:16px; font-weight:700; color: #E2EAF4; }

.field-select {
  width:100%; background:#060A0F; border:1px solid #1A2535;
  border-radius:4px; padding:12px; color:#E2EAF4;
  font-size:14px; appearance:none; cursor:pointer;
  font-family:'Outfit',sans-serif; outline:none; transition:border-color .2s;
}
.field-select:focus { border-color:#00D4FF; }

.divider { height:1px; background:#1A2535; margin:1rem 0; }

.section-label { font-size:11px; color:#4A6080; font-family:'DM Mono',monospace; text-transform:uppercase; letter-spacing:0.08em; }

/* ── BASELINE CARD (IMAGE STYLE) ── */
.baseline-card {
  background: #060A0F;
  border: 1px solid #1A2535;
  border-radius: 6px;
  padding: 16px;
  margin-top: 8px;
}
.formula-text {
  font-size: 11px;
  color: #4A6080;
  margin-bottom: 16px;
}
.baseline-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #1A2535;
  font-size: 13px;
  color: #4A6080;
}
.v-blue {
  color: #00D4FF;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
}

/* ── WARNING BOX (IMAGE STYLE) ── */
.img-warning-box {
  margin-top: 16px;
  padding: 12px;
  background: #FF6B3508;
  border: 1px solid #FF6B3533;
  border-radius: 4px;
  font-size: 12px;
  color: #FF6B35;
  line-height: 1.5;
}

/* ── RUN BUTTON (IMAGE STYLE) ── */
.btn-run-ai {
  width: 100%;
  margin-top: 16px;
  background: #00D4FF;
  color: #060A0F;
  border: none;
  border-radius: 4px;
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.btn-run-ai:hover { opacity: 0.9; }
.btn-run-ai:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── RIGHT COLUMN STYLES ── */
.pulse-dot { width:8px; height:8px; border-radius:50%; animation:pulse 1.8s ease-in-out infinite; flex-shrink:0; }
.ai-loader    { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:3rem 0; }
.spinner      { width:36px; height:36px; border:2px solid #1A2535; border-radius:50%; animation:spin 1s linear infinite; }
.spinner-text { font-family:'DM Mono',monospace; font-size:12px; color:#4A6080; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 1rem; color: #4A6080; text-align: center; }
.empty-icon  { margin-bottom: 16px; color: #1A2535; stroke-width: 1.5; }
.empty-text  { font-size: 14px; font-weight: 500; max-width: 240px; line-height: 1.5; }

.score-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.score-box  { border-radius:6px; padding:16px; text-align:center; min-height: 100px; display: flex; flex-direction: column; justify-content: center; }
.score-label{ font-size:10px; color:#4A6080; font-family:'DM Mono',monospace; margin-bottom:6px; }
.score-value{ font-weight:800; line-height:1.1; margin-bottom:4px; }
.score-sub  { font-size:10px; color:#4A6080; font-family:'DM Mono',monospace; }

.vuln-box-large { background: #FF6B3512; border: 1px solid #FF6B3544; border-radius: 6px; padding: 16px; color: #FF6B35; font-size: 13.5px; line-height: 1.6; font-weight: 500; }

.findings-text {
  font-size: 14px;
  line-height: 1.6;
  color: #E2E8F0;
  margin-bottom: 20px;
}

.reasoning-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  .reasoning-grid { grid-template-columns: 1fr; }
}

.reason-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.reason-key {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #00D4FF;
  margin-bottom: 4px;
  font-weight: 700;
}

.reason-val {
  font-size: 13px;
  line-height: 1.5;
  color: #94A3B8;
}

.budget-reasoning-box {
  background: rgba(255, 210, 63, 0.05);
  border: 1px solid rgba(255, 210, 63, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.matching-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.matching-table th { text-align: left; padding: 8px; font-size: 11px; color: #4A6080; font-family: 'DM Mono', monospace; font-weight: 400; border-bottom: 1px solid #1A2535; }
.matching-table td { padding: 10px 8px; border-bottom: 1px solid #1A2535; vertical-align: middle; }
.mono { font-family: 'DM Mono', monospace; }
.green { color: #00E5A0; }

.diff-chip { font-size: 11px; font-family: 'DM Mono', monospace; font-weight: 700; }
.diff-chip.plus { color: #FF3B5C; }
.diff-chip.minus { color: #00E5A0; }

.tags-row { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
.tag {
  display:inline-block; padding:2px 10px;
  background:#00D4FF18; border:1px solid #00D4FF44;
  color:#00D4FF; font-size:11px; font-family:'DM Mono',monospace;
  border-radius:2px; font-weight:500;
}
.tag.green-mono { background: #00E5A010; border-color: #00E5A033; color: #00E5A0; }

.approval-area { margin-top: 20px; padding: 1.5rem; background: #060A0F; border: 1px dashed #1A2535; border-radius: 8px; text-align: center; }
.approval-area.success { border: 1px solid #00E5A033; background: #00E5A008; }
.btn-approve { background: #00E5A0; color: #060A0F; border: none; border-radius: 4px; padding: 12px 24px; font-size: 14px; font-weight: 800; cursor: pointer; width: 100%; transition: opacity 0.2s; }
.btn-approve:disabled { opacity:0.5; }
</style>
