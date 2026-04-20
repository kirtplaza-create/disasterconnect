<template>
  <div class="fade-up">

    <!-- ── PAGE HEADER ── -->
    <div style="margin-bottom: 20px;">
      <div class="module-label">AI MODULE 01</div>
      <h1 class="page-title">AI Disaster Analysis</h1>
      <p class="page-sub">DisasterConnect AI performs NLP on disaster reports to extract severity, urgency, and priority needs</p>
    </div>

    <!-- ── TWO COLUMN LAYOUT ── -->
    <div class="two-col">

      <!-- ── LEFT: Select Report ── -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">Select Report</div>

        <!-- Report dropdown -->
        <select v-model="sel" class="field-select">
          <option v-for="r in reports" :key="r.id" :value="r.id">
            {{ r.id }} — {{ r.brgy }} ({{ r.dtype }})
          </option>
        </select>

        <!-- Report summary (shown when a report is selected) -->
        <template v-if="report">
          <div class="divider" />
          <div class="section-label">Report Summary</div>

          <!-- Key-value rows -->
          <div v-for="[k, v] in reportSummaryRows" :key="k" class="kv-row">
            <span class="kv-key">{{ k }}</span>
            <span class="kv-val">{{ v }}</span>
          </div>

          <!-- Description box -->
          <div class="desc-box">
            <div class="desc-label">Description</div>
            <div class="desc-text">{{ report.desc }}</div>
          </div>

          <!-- Run button -->
          <button
            class="btn-primary"
            style="width: 100%; justify-content: center; margin-top: 16px; min-height: 48px;"
            :disabled="loading"
            @click="runAnalysis"
          >
            <span v-if="loading" style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-spinner fa-spin"></i>
              {{ statusMsg || 'Analyzing...' }}
            </span>
            <span v-else style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <Brain :size="16" /> Run AI Analysis
            </span>
          </button>

          <div v-if="errorMsg" style="margin-top: 12px; padding: 12px; background: rgba(255,59,92,0.1); border: 1px solid rgba(255,59,92,0.2); border-radius: 6px; color: #FF3B5C; font-size: 12px;">
            <strong>Error:</strong> {{ errorMsg }}
          </div>
        </template>
      </div>

      <!-- ── RIGHT: AI Output ── -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div class="pulse-dot" />
          <div class="card-title">DisasterConnect AI Analysis Output</div>
        </div>

        <!-- Loading spinner with Live Log -->
        <div v-if="loading" class="ai-loader">
          <div class="spinner" />
          <div class="loader-meta">
            <span class="spinner-text">Analyzing disaster report...</span>
            <span class="timer-badge">ELAPSED: {{ runtime }}s</span>
          </div>
          
          <!-- Generation Heartbeat Log -->
          <div class="activity-log-container">
             <div v-for="(log, i) in activityLogs.slice().reverse()" :key="i" class="log-entry" :class="{ 'latest': i === 0 }">
                <span class="log-time">[{{ log.time }}s]</span>
                <span class="log-msg">{{ log.msg }}</span>
             </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!result" class="empty-state">
          <Brain :size="64" class="empty-icon" />
          <div class="empty-text">Select a report and click Run AI Analysis</div>
        </div>

        <!-- Error state -->
        <div v-else-if="result.error" style="color: #FF3B5C; padding: 1rem; font-size: 13px;">
          {{ result.error }}
        </div>

        <!-- ── RESULTS ── -->
        <div v-else class="fade-up">

          <!-- Scoring Grid (Expanded with Factors) -->
          <div class="score-grid-large">
            <!-- Severity Card -->
            <div class="analysis-score-card" :style="{ borderTop: `4px solid ${sevColor(result.severity?.level)}` }">
              <div class="score-header">
                <span class="score-label">SEVERITY ANALYSIS</span>
                <span class="score-level-badge" :style="{ background: sevColor(result.severity?.level) + '22', color: sevColor(result.severity?.level) }">
                  {{ result.severity?.level?.toUpperCase() }}
                </span>
              </div>
              <div class="score-main">
                <div class="score-num">{{ result.severity?.score }}<span class="score-max">/100</span></div>
                <div class="progress-bg"><div class="progress-fill" :style="{ width: result.severity?.score + '%', background: sevColor(result.severity?.level) }" /></div>
              </div>
              <div class="factor-box">
                <div class="factor-item"><span class="f-lbl">Push Factors:</span> {{ result.severity?.pushFactors }}</div>
                <div class="factor-item"><span class="f-lbl">Kept Lower By:</span> {{ result.severity?.keptLowerFactors }}</div>
                <div class="factor-item t-warn"><span class="f-lbl">Increase Trigger:</span> {{ result.severity?.increaseKillers }}</div>
              </div>
            </div>

            <!-- Urgency/Vulnerability Card -->
            <div class="analysis-score-card" :style="{ borderTop: `4px solid ${sevColor(result.urgency?.level)}` }">
              <div class="score-header">
                <span class="score-label">URGENCY & VULNERABILITY</span>
                <span class="score-level-badge" :style="{ background: sevColor(result.urgency?.level) + '22', color: sevColor(result.urgency?.level) }">
                  {{ result.urgency?.level?.toUpperCase() }}
                </span>
              </div>
              <div class="score-main">
                <div class="score-num">{{ result.urgency?.score }}<span class="score-max">/100</span></div>
                <div class="progress-bg"><div class="progress-fill" :style="{ width: result.urgency?.score + '%', background: sevColor(result.urgency?.level) }" /></div>
              </div>
              <div class="factor-box">
                <div class="factor-item"><span class="f-lbl">Push Factors:</span> {{ result.urgency?.pushFactors }}</div>
                <div class="factor-item"><span class="f-lbl">Kept Lower By:</span> {{ result.urgency?.keptLowerFactors }}</div>
                <div class="factor-item t-warn"><span class="f-lbl">Increase Trigger:</span> {{ result.urgency?.increaseKillers }}</div>
              </div>
            </div>
          </div>

          <!-- Classification -->
          <div class="section-label" style="margin-top: 24px;">CLASSIFICATION & CONTEXT</div>
          <p class="paragraph-text">{{ result.classification }}</p>

          <div class="divider" />

          <!-- Key Findings (Timeline View) -->
          <div class="section-label">KEY FINDINGS & ANALYSIS</div>
          <div class="findings-container">
             <div class="finding-block">
               <div class="f-key">Disproportionate Impact</div>
               <div class="f-val">{{ result.keyFindings?.disproportionateImpact }}</div>
             </div>
             <div class="finding-block">
               <div class="f-key">Infrastructure & Capacity Gaps</div>
               <div class="f-val">{{ result.keyFindings?.compoundingInfrastructure }} {{ result.keyFindings?.capacityGaps }}</div>
             </div>
             
             <!-- Urgency Timeline -->
             <div class="timeline-box">
               <div class="timeline-title">Urgency Timeline (Consequences of Delay)</div>
               <div class="timeline-grid">
                 <div class="t-col">
                   <div class="t-hour">24 HOURS</div>
                   <div class="t-desc">{{ result.keyFindings?.timeline?.h24 }}</div>
                 </div>
                 <div class="t-col">
                   <div class="t-hour">48 HOURS</div>
                   <div class="t-desc">{{ result.keyFindings?.timeline?.h48 }}</div>
                 </div>
                 <div class="t-col">
                   <div class="t-hour">72 HOURS</div>
                   <div class="t-desc">{{ result.keyFindings?.timeline?.h72 }}</div>
                 </div>
               </div>
             </div>
          </div>

          <div class="divider" />

          <!-- Priority Relief Needs (Cards) -->
          <div class="section-label">PRIORITY RELIEF NEEDS</div>
          <div class="needs-grid-detailed">
            <div v-for="n in result.priorityNeeds" :key="n.need" class="need-detail-card">
              <div class="n-header">
                <span class="n-title">{{ n.need }}</span>
                <span class="n-actor">{{ n.actor }}</span>
              </div>
              <div class="n-body">
                <div class="n-info"><span class="n-lbl">Rationale:</span> {{ n.why }}</div>
                <div class="n-info t-danger"><span class="n-lbl">Risk:</span> {{ n.consequence }}</div>
              </div>
            </div>
          </div>

          <div class="divider" />

          <!-- Immediate Action Plan (Phase based) -->
          <div class="section-label">IMMEDIATE ACTION PLAN (NDRRMC ALIGNED)</div>
          <div class="action-phases">
            <div class="phase-card">
              <div class="phase-hdr">Phase 1: Hour 0-6 (First Response)</div>
              <div class="phase-body">
                <div class="p-item"><strong>Critical Actions:</strong> {{ result.actionPlan?.h0_6?.actions }}</div>
                <div class="p-item"><strong>Responsibility:</strong> {{ result.actionPlan?.h0_6?.responsible }}</div>
                <div class="p-item"><strong>Required:</strong> {{ result.actionPlan?.h0_6?.resources }}</div>
              </div>
            </div>
            <div class="phase-card">
              <div class="phase-hdr">Phase 2: Hour 6-24 (Mobilization)</div>
              <div class="phase-body">
                <div class="p-item"><strong>Actions:</strong> {{ result.actionPlan?.h6_24?.actions }}</div>
                <div class="p-item"><strong>Coordination:</strong> {{ result.actionPlan?.h6_24?.coordination }}</div>
                <div class="p-item"><strong>Comms:</strong> {{ result.actionPlan?.h6_24?.communication }}</div>
              </div>
            </div>
            <div class="phase-card">
              <div class="phase-hdr">Phase 3: Day 2-3 (Sustained)</div>
              <div class="phase-body">
                <div class="p-item"><strong>Sustained:</strong> {{ result.actionPlan?.d2_3?.actions }}</div>
                <div class="p-item"><strong>Monitoring:</strong> {{ result.actionPlan?.d2_3?.monitoring }}</div>
                <div class="p-item"><strong>Transition:</strong> {{ result.actionPlan?.d2_3?.transition }}</div>
              </div>
            </div>
          </div>

          <div class="divider" />

          <!-- Risk Factors (Detailed Matrix) -->
          <div class="section-label">RISK FACTOR MATRIX</div>
          <div v-for="rf in result.riskFactors" :key="rf.risk" class="risk-matrix-row">
             <div class="rm-main">
               <div class="rm-title">
                 <AlertTriangle :size="18" class="rm-icon" />
                 {{ rf.risk }}
                 <span class="rm-likelihood" :class="rf.likelihood?.toLowerCase()">{{ rf.likelihood }}</span>
               </div>
               <div class="rm-trigger">{{ rf.trigger }}</div>
             </div>
             <div class="rm-mitigation">
               <div class="rm-m-lbl">Mitigation Action:</div>
               <div>{{ rf.mitigation }}</div>
               <div class="rm-time">Critical in: {{ rf.timeframe }}</div>
             </div>
          </div>

          <!-- Report Status Summary -->
          <div v-if="result.reportStatus" class="status-summary-box" :class="{ 'needs-data': result.reportStatus.recommendation === 'MORE_DATA' }">
             <div class="status-hdr">
               <span class="status-indicator" />
               REPORT STATUS: {{ result.reportStatus.recommendation?.replace('_', ' ') }}
             </div>
             <p class="status-text">{{ result.reportStatus.summary }}</p>
             <div v-if="result.reportStatus.missingInfo?.length" class="missing-info">
               <div class="m-lbl">Missing Information for Full Assessment:</div>
               <ul class="m-list">
                 <li v-for="m in result.reportStatus.missingInfo" :key="m">{{ m }}</li>
               </ul>
             </div>
          </div>

          <div v-if="report && report.status !== 'approved'" class="approval-area">
            <p style="font-size: 12px; color: #4A6080; margin-bottom: 12px; font-style: italic;">Confirm situation analysis and proceed to needs assessment.</p>
            <button class="btn-approve" @click="approveReport" :disabled="approving" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle v-if="!approving" :size="18" />
              {{ approving ? 'Approving...' : 'Approve & Finalize Situation Report' }}
            </button>
          </div>
          <div v-else-if="report && report.status === 'approved'" class="approval-area success">
            <div style="color: #00E5A0; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <CheckCircle :size="16" /> Situation Report Approved
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { askAI, parseAIJSON } from '../services/aiService'
import { Brain, AlertTriangle, CheckCircle } from 'lucide-vue-next'

// ─── PROPS & EMITS ────────────────────────────────────────────────────────────
const props = defineProps({
  reports: { type: Array, required: true },
})
const emit = defineEmits(['update:reports'])

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const sevColor = (s) => {
  const map = {
    Catastrophic: '#FF3B5C',
    Critical:     '#FF3B5C',
    Serious:      '#FF6B35',
    High:         '#FF6B35',
    Moderate:     '#FFD23F',
    Minor:        '#00E5A0',
    Low:          '#00E5A0',
    Urgent:       '#FF6B35',
    Routine:      '#00E5A0'
  }
  return map[s] || '#4A6080'
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const sel       = ref(props.reports[0]?.id || null)
const loading   = ref(false)
const approving = ref(false)
const statusMsg = ref('')
const errorMsg  = ref('')
const result    = ref(null)

// ─── GENERATION FEEDBACK ───
const runtime = ref(0)
const activityLogs = ref([])
let timerInterval = null

const addLog = (msg) => {
  activityLogs.value.push({ time: runtime.value, msg })
  statusMsg.value = msg
  if (activityLogs.value.length > 20) activityLogs.value.shift()
}

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })


// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const report = computed(() => props.reports.find(r => r.id === sel.value))

const reportSummaryRows = computed(() => {
  if (!report.value) return []
  const r = report.value
  return [
    ['Barangay',          r.brgy],
    ['Municipality',      r.muni],
    ['Disaster Type',     r.dtype],
    ['Families Affected', r.families],
    ['Individuals',       r.individuals],
    ['Evacuees',          r.evacuees],
    ['Injured',           r.injured],
    ['Elderly',           r.elderly],
    ['Children',          r.children],
    ['Date',              r.date],
  ]
})

const systemPromptRef = ref(`Your role is to ANALYZE the disaster situation and produce a comprehensive situation report for LGU decision makers based on a provided report.

Produce the following structured analysis:

### SEVERITY & URGENCY SCORING
Rate both on a scale of 1-100. Explain WHY you gave that score.
Consider:
- Number of displaced individuals and families
- Presence of vulnerable groups (elderly, children, injured, PWDs)
- Infrastructure damage level
- Accessibility of the area
- Weather conditions and ongoing risks
- Local government capacity to respond

For each score explain:
- What factors pushed the score higher
- What factors kept the score from being higher
- What would cause the score to increase further

### CLASSIFICATION
Write a detailed paragraph covering:
- Type of disaster and its cause
- Exact location and affected barangay/municipality
- Total population affected (families and individuals)
- Breakdown of vulnerable demographics (elderly %, children %, injured count)
- Current state of local infrastructure
- Impact on emergency response capacity
- Comparison to similar past disaster events in the region

### KEY FINDINGS
Provide an in-depth analysis covering:
- Which demographics are most disproportionately affected and why
- How infrastructure damage is compounding the crisis
- Secondary risks caused by the disaster (disease, exposure, malnutrition)
- Gaps between current local capacity and actual needs
- Urgency timeline (24/48/72h consequences)

### PRIORITY RELIEF NEEDS
List top 3-5 needs with rationales, consequences of inaction, and best-positioned actors.

### IMMEDIATE ACTION PLAN
Numbered steps for Hour 0-6 (First Response), Hour 6-24 (Mobilization), and Day 2-3 (Sustained Response).

### RISK FACTORS
Identify risks, triggers, likelihood, timeframe, and mitigation measures.

### REPORT STATUS
Summarize situation, recommend approval or more data, and list missing info.`);

// ─── RUN ANALYSIS ─────────────────────────────────────────────────────────────
let lastRun = 0;
async function runAnalysis() {
  const now = Date.now();
  if (now - lastRun < 3000) {
    console.warn('Analysis throttled - too many calls');
    return;
  }
  lastRun = now;

  console.log('[LGU Analysis] runAnalysis triggered', { reportId: sel.value });
  if (!report.value || loading.value) return
  
  // Reset state
  loading.value = true
  runtime.value = 0
  activityLogs.value = []
  errorMsg.value = ''
  result.value  = null

  // Start Timer & Heartbeat
  addLog('Initializing DisasterConnect Expert Persona...')
  timerInterval = setInterval(() => {
    runtime.value++
    // Heartbeat messages for reassurance
    if (runtime.value === 30)  addLog('Analyzing report context & NDRRMC alignment...')
    if (runtime.value === 60)  addLog('Synthesizing severity & urgency metrics...')
    if (runtime.value === 90)  addLog('Developing immediate action plan phases...')
    if (runtime.value === 120) addLog('Evaluating secondary risk factors...')
    if (runtime.value === 150) addLog('Local machine processing high-token density...')
    if (runtime.value === 210) addLog('Finalizing detailed expert context paragraph...')
    if (runtime.value === 260) addLog('Formatting structured JSON response...')
  }, 1000)

  const r = report.value
  const system = `You are DisasterConnect, an expert disaster situation analyst specialized in the Philippine context.
MANDATORY: Respond strictly with VALID JSON that adheres to the provided schema. 

══ EXPERT ANALYST GUIDELINES ══
${systemPromptRef.value}

══ SCORING GUIDELINES ══
SEVERITY SCORE (1-100):
1-30   = Minor incident, local resources sufficient
31-50  = Moderate, LGU response needed
51-70  = Serious, provincial support recommended
71-90  = Critical, regional NDRRMC activation needed
91-100 = Catastrophic, national response required

URGENCY/VULNERABILITY SCORE (1-100):
1-30   = Low vulnerability, standard response timeline
31-50  = Moderate vulnerability, response within 24hrs
51-70  = High vulnerability, response within 12hrs
71-90  = Critical vulnerability, response within 6hrs
91-100 = Extreme vulnerability, immediate response required

══ OPERATIONAL PROTOCOLS ══
- Always cite NDRRMC protocols when recommending actions.
- Always prioritize elderly, children, injured, and PWDs.
- Always be specific to the Philippine barangay context.
- Use clear, direct language that LGU officials can act on immediately.

══ JSON SCHEMA ══
{
  "severity": { "score": 1-100, "level": "Minor|Moderate|Serious|Critical|Catastrophic", "pushFactors": "string", "keptLowerFactors": "string", "increaseKillers": "string" },
  "urgency": { "score": 1-100, "level": "Routine|Moderate|High|Critical|Extreme", "pushFactors": "string", "keptLowerFactors": "string", "increaseKillers": "string" },
  "classification": "Detailed expert context paragraph",
  "keyFindings": {
    "disproportionateImpact": "string",
    "compoundingInfrastructure": "string",
    "secondaryRisks": "string",
    "capacityGaps": "string",
    "timeline": { "h24": "string", "h48": "string", "h72": "string" }
  },
  "priorityNeeds": [
    { "need": "string", "why": "string", "consequence": "string", "actor": "string" }
  ],
  "actionPlan": {
    "h0_6": { "actions": "string", "responsible": "string", "resources": "string" },
    "h6_24": { "actions": "string", "coordination": "string", "communication": "string" },
    "d2_3": { "actions": "string", "monitoring": "string", "transition": "string" }
  },
  "riskFactors": [
    { "risk": "string", "trigger": "string", "likelihood": "Low|Medium|High|Critical", "timeframe": "string", "mitigation": "string" }
  ],
  "reportStatus": { "summary": "string", "recommendation": "APPROVED|MORE_DATA", "missingInfo": ["string"] }
}`

  const prompt = `Report Details:
  - Location: ${r.brgy}, ${r.muni}
  - Type: ${r.dtype}
  - Impact: ${r.families} families (${r.individuals} people)
  - Vulnerability: ${r.elderly} elderly, ${r.children} children, ${r.evacuees} evacuees, ${r.injured} injured
  - Brgy Description: ${r.desc}
  
  Generate the expert situation report in JSON format.`

  try {
    addLog('Consulting Local AI Model (Llama 3.1)...')
    const raw = await askAI(system, prompt)
    
    addLog('Parsing Expert Report Structure...')
    const parsed = parseAIJSON(raw)
    
    addLog('Finalizing Situation Report...')
    result.value = parsed
    loading.value = false
    if (timerInterval) clearInterval(timerInterval)

    // PERSISTENCE DATA
    const update = {
      aiAnalysis: parsed,
      severity: parsed.severity?.level || 'Moderate'
    }

    // Background Sync
    updateDoc(doc(db, 'reports', sel.value), update)
      .then(() => console.log("✅ Analysis Synced"))
      .catch(err => console.error("❌ Sync Error:", err))

  } catch (e) {
    console.error(e)
    result.value = { error: `AI Analysis Failed: ${e.message}` }
    loading.value = false
    if (timerInterval) clearInterval(timerInterval)
  }
}

async function approveReport() {
  if (!report.value || !result.value) return
  approving.value = true
  try {
    await updateDoc(doc(db, 'reports', sel.value), {
      status: 'approved',
      approvedAt: new Date().toISOString()
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
.fade-up { animation: fadeUp 0.4s ease forwards; }

.module-label { font-size:10px; color:#00D4FF; font-family:'DM Mono',monospace; letter-spacing:0.12em; margin-bottom:4px; }
.page-title   { font-size:22px; font-weight:800; }
.page-sub     { color:#4A6080; font-size:13px; margin-top:4px; }
.two-col { display:grid; grid-template-columns:1fr 1.2fr; gap:16px; }
.card      { background:#0D1219; border:1px solid #1A2535; border-radius:6px; padding:1.25rem; }
.card-title{ font-size:14px; font-weight:700; }

.field-select {
  width:100%; background:#060A0F; border:1px solid #1A2535;
  border-radius:4px; padding:8px 12px; color:#E2EAF4;
  font-size:13px; appearance:none; cursor:pointer;
  font-family:'Outfit',sans-serif; outline:none; transition:border-color .2s;
}
.field-select:focus { border-color:#00D4FF; }
.divider { height:1px; background:#1A2535; margin:1rem 0; }
.section-label { font-size:11px; color:#4A6080; font-family:'DM Mono',monospace; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px; }
.kv-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #1A2535; }
.kv-key { font-size:12px; color:#4A6080; }
.kv-val { font-size:12px; font-family:'DM Mono',monospace; color:#E2EAF4; }
.desc-box  { margin-top:12px; padding:10px; background:#060A0F; border-radius:4px; border:1px solid #1A2535; }
.desc-label{ font-size:11px; color:#4A6080; margin-bottom:4px; }
.desc-text { font-size:12px; line-height:1.6; color:#E2EAF4; }

.btn-primary {
  background:#00D4FF; color:#060A0F; border:none; border-radius:4px;
  padding:9px 20px; font-size:13px; font-weight:600; cursor:pointer;
  transition:opacity .2s; display:inline-flex; align-items:center;
  gap:6px; font-family:'Outfit',sans-serif;
}
.btn-primary:hover    { opacity:0.85; }
.btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

.pulse-dot { width:8px; height:8px; border-radius:50%; background:#00D4FF; animation:pulse 1.8s ease-in-out infinite; flex-shrink:0; }
.ai-loader    { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:3rem 1.5rem; background: #060A0F; border-radius: 8px; border: 1px solid #1A2535; }
.spinner      { width:36px; height:36px; border:2px solid #1A2535; border-top:2px solid #00D4FF; border-radius:50%; animation:spin 1s linear infinite; }
.loader-meta  { display: flex; align-items: center; gap: 12px; }
.spinner-text { font-family:'DM Mono',monospace; font-size:12px; color:#E2EAF4; }
.timer-badge  { background: #1A2535; color: #00D4FF; font-family: 'DM Mono', monospace; font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid #00D4FF33; }

.activity-log-container { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.log-entry { font-family: 'DM Mono', monospace; font-size: 11px; color: #4A6080; display: flex; gap: 10px; opacity: 0.6; transition: all 0.3s; }
.log-entry.latest { opacity: 1; color: #00D4FF; transform: scale(1.02); }
.log-time { color: #1A2535; background: #4A6080; padding: 0 4px; border-radius: 2px; color: #E2EAF4; font-weight: 700; height: fit-content; }
.log-msg  { line-height: 1.4; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 1rem; color: #4A6080; text-align: center; }
.empty-icon  { margin-bottom: 16px; color: #1A2535; stroke-width: 1.5; }
.empty-text  { font-size: 14px; font-weight: 500; max-width: 240px; line-height: 1.5; }

/* ── EXPANDED SCORECARDS ── */
.score-grid-large { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.analysis-score-card { background: #0D1219; border: 1px solid #1A2535; border-radius: 8px; padding: 20px; }
.score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.score-level-badge { padding: 4px 10px; font-size: 10px; font-weight: 800; border-radius: 4px; font-family: 'DM Mono', monospace; }
.score-main { margin-bottom: 16px; }
.score-num { font-size: 32px; font-weight: 800; color: #E2EAF4; }
.score-max { font-size: 14px; color: #4A6080; margin-left: 2px; }
.progress-bg { height: 6px; background: #060A0F; border-radius: 3px; margin-top: 8px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 1s ease; }

.factor-box { display: flex; flex-direction: column; gap: 8px; }
.factor-item { font-size: 11px; line-height: 1.5; color: #94A3B8; }
.f-lbl { font-weight: 700; color: #4A6080; margin-right: 4px; }
.t-warn { color: #FFD23F; }

.paragraph-text { font-size: 13.5px; line-height: 1.7; color: #E2EAF4; margin-bottom: 16px; }

/* ── KEY FINDINGS & TIMELINE ── */
.findings-container { display: flex; flex-direction: column; gap: 16px; }
.finding-block { border-left: 2px solid #1A2535; padding-left: 12px; }
.f-key { font-size: 11px; font-weight: 700; color: #00D4FF; margin-bottom: 4px; text-transform: uppercase; }
.f-val { font-size: 13px; line-height: 1.6; color: #94A3B8; }

.timeline-box { background: #060A0F; border: 1px solid #1A2535; border-radius: 6px; padding: 20px; margin-top: 8px; }
.timeline-title { font-size: 11px; font-weight: 700; color: #FFD23F; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.1em; }
.timeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.t-col { display: flex; flex-direction: column; gap: 8px; }
.t-hour { font-size: 10px; font-weight: 800; color: #E2EAF4; background: #1A2535; padding: 4px 8px; border-radius: 4px; align-self: flex-start; }
.t-desc { font-size: 12px; line-height: 1.5; color: #4A6080; }

/* ── PRIORITY CARDS ── */
.needs-grid-detailed { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.need-detail-card { background: #0D1219; border: 1px solid #1A2535; border-radius: 8px; padding: 16px; }
.n-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.n-title { font-size: 14px; font-weight: 700; color: #E2EAF4; }
.n-actor { font-size: 9px; padding: 2px 6px; background: #00D4FF12; color: #00D4FF; border: 1px solid #00D4FF33; border-radius: 4px; font-family: 'DM Mono', monospace; }
.n-info { font-size: 12px; line-height: 1.5; color: #94A3B8; margin-bottom: 6px; }
.n-lbl { font-weight: 700; color: #4A6080; }
.t-danger { color: #FF3B5C; }

/* ── ACTION PHASES ── */
.action-phases { display: flex; flex-direction: column; gap: 12px; }
.phase-card { background: #060A0F; border: 1px solid #1A2535; border-radius: 6px; overflow: hidden; }
.phase-hdr { background: #1A2535; padding: 8px 16px; font-size: 11px; font-weight: 700; color: #E2EAF4; text-transform: uppercase; }
.phase-body { padding: 12px 16px; }
.p-item { font-size: 12px; margin-bottom: 6px; color: #94A3B8; line-height: 1.5; }

/* ── RISK MATRIX ── */
.risk-matrix-row { display: flex; gap: 20px; padding: 16px; background: #0D1219; border: 1px solid #1A2535; border-radius: 8px; margin-bottom: 8px; }
.rm-main { flex: 1; }
.rm-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #E2EAF4; margin-bottom: 8px; }
.rm-icon { color: #FF3B5C; font-size: 18px; }
.rm-likelihood { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-family: 'DM Mono', monospace; }
.rm-likelihood.critical { background: #FF3B5C22; color: #FF3B5C; border: 1px solid #FF3B5C44; }
.rm-likelihood.high { background: #FF6B3522; color: #FF6B35; border: 1px solid #FF6B3544; }
.rm-likelihood.medium { background: #FFD23F22; color: #FFD23F; border: 1px solid #FFD23F44; }
.rm-trigger { font-size: 12px; color: #4A6080; font-style: italic; }
.rm-mitigation { flex: 1.2; border-left: 1px solid #1A2535; padding-left: 20px; font-size: 12px; color: #94A3B8; line-height: 1.5; }
.rm-m-lbl { font-size: 10px; font-weight: 700; color: #00E5A0; margin-bottom: 4px; text-transform: uppercase; }
.rm-time { margin-top: 8px; font-size: 10px; color: #4A6080; font-family: 'DM Mono', monospace; }

/* ── STATUS SUMMARY ── */
.status-summary-box { background: #0D1219; border: 1px solid #00D4FF44; border-radius: 8px; padding: 20px; margin-top: 32px; position: relative; }
.status-summary-box.needs-data { border-color: #FFD23F66; background: #FFD23F08; }
.status-hdr { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 800; color: #E2EAF4; margin-bottom: 12px; letter-spacing: 0.1em; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #00E5A0; box-shadow: 0 0 10px #00E5A0; }
.needs-data .status-indicator { background: #FFD23F; box-shadow: 0 0 10px #FFD23F; }
.status-text { font-size: 14px; color: #E2EAF4; line-height: 1.6; font-style: italic; font-weight: 500; }
.missing-info { margin-top: 16px; border-top: 1px solid #1A2535; padding-top: 16px; }
.m-lbl { font-size: 10px; font-weight: 700; color: #FF3B5C; margin-bottom: 8px; text-transform: uppercase; }
.m-list { margin: 0; padding-left: 18px; color: #4A6080; font-size: 12px; line-height: 1.8; }

.approval-area { margin-top: 32px; padding: 2rem; background: #060A0F; border: 1px dashed #1A2535; border-radius: 8px; text-align: center; }
.approval-area.success { border: 1px solid #00E5A033; background: #00E5A008; }
.btn-approve { background: #00E5A0; color: #060A0F; border: none; border-radius: 4px; padding: 14px 32px; font-size: 14px; font-weight: 800; cursor: pointer; width: 100%; transition: opacity 0.2s; }
.btn-approve:disabled { opacity:0.5; }
</style>
