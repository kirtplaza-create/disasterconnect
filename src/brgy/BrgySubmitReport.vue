<template>
  <div class="fade-up">

    <!-- Success Screen -->
    <div v-if="done" class="success-screen fade-up">
      <div class="success-icon float"><CheckCircle :size="64" color="var(--color-success)" /></div>
      <div class="success-title">Report Submitted to LGU!</div>
      <div class="success-sub">
        Your disaster report has been sent to the LGU Operations Center for review.
        Relief allocation updates will follow shortly.
      </div>
      <div class="ref-box">
        <div class="ref-label">REPORT REFERENCE</div>
        <div class="ref-val">{{ submittedRef }}</div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-primary" @click="reset">Submit Another Report</button>
        <button class="btn-ghost" @click="$emit('navigate', 'reports')">View My Reports</button>
      </div>
    </div>

    <!-- Form -->
    <template v-else>
      <div class="page-header">
        <div>
          <div class="portal-label">BARANGAY PORTAL</div>
          <h1 class="page-title">Submit Disaster Report</h1>
          <p class="page-sub">
            Fill in the details below. Fields marked
            <span class="auto-tag">AUTO</span>
            are automatically calculated from your Resident List.
          </p>
        </div>
      </div>

      <!-- No residents warning -->
      <div v-if="residents.length === 0" class="warn-banner">
        <AlertTriangle :size="16" /> <span>No residents registered yet. <strong>Auto-calculated fields</strong> will show 0. Add residents first for accurate counts.</span>
      </div>

      <div class="form-grid">

        <!-- Left: Location & Disaster Info -->
        <div class="card">
          <div class="card-title"><MapPin :size="14" style="display:inline; margin-right:6px;" /> Location &amp; Disaster Info</div>

          <div class="field-group">
            <label class="field-label">Barangay</label>
            <input v-model="form.barangay" class="field-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Municipality / City</label>
            <input v-model="form.municipality" class="field-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Disaster Type</label>
            <select v-model="form.dtype" class="field-select">
              <option v-for="t in DISASTER_TYPES" :key="t">{{ t }}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Estimated Severity</label>
            <div class="severity-row">
              <button v-for="s in SEVERITIES" :key="s" class="sev-btn"
                :class="{ active: form.severity === s }"
                :style="form.severity===s ? { borderColor: sevColor(s), background: sevDimColor(s), color: sevColor(s) } : {}"
                @click="form.severity = s">{{ s }}</button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Date of Report</label>
            <input type="date" v-model="form.date" class="field-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Situation Description <span class="required">*</span></label>
            <textarea v-model="form.desc" rows="4" class="field-textarea"
              placeholder="Describe the situation — water level, damage, road access, urgent needs..."></textarea>
          </div>
        </div>

        <!-- Right: Population + Summary -->
        <div class="right-col">

          <!-- Affected Population -->
          <div class="card">
            <div class="card-title"><Users :size="14" style="display:inline; margin-right:6px;" /> Affected Population</div>
            <div class="card-sub">Auto fields are pulled live from your registered Resident List.</div>

            <div class="auto-grid">
              <div style="margin-bottom:12px">
                <label style="display:flex;align-items:center;font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Families Affected<span class="auto-tag">AUTO</span></label>
                <div style="width:100%;background:var(--color-success-dim);border:1px solid var(--color-success-dim);border-radius:6px;padding:10px 12px;font-size:14px;font-weight:700;font-family:monospace;color:var(--color-warn)">
                  {{ autoFamilies ?? '—' }}
                </div>
              </div>
              <div style="margin-bottom:12px">
                <label style="display:flex;align-items:center;font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Total Individuals<span class="auto-tag">AUTO</span></label>
                <div style="width:100%;background:var(--color-success-dim);border:1px solid var(--color-success-dim);border-radius:6px;padding:10px 12px;font-size:14px;font-weight:700;font-family:monospace;color:var(--color-warn)">
                  {{ autoIndividuals ?? '—' }}
                </div>
              </div>
              <div style="margin-bottom:12px">
                <label style="display:flex;align-items:center;font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Elderly (Age > 60)<span class="auto-tag">AUTO</span></label>
                <div style="width:100%;background:var(--color-success-dim);border:1px solid var(--color-success-dim);border-radius:6px;padding:10px 12px;font-size:14px;font-weight:700;font-family:monospace;color:var(--color-high)">
                  {{ autoElderly ?? '—' }}
                </div>
              </div>
              <div style="margin-bottom:12px">
                <label style="display:flex;align-items:center;font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Children (Age < 17)<span class="auto-tag">AUTO</span></label>
                <div style="width:100%;background:var(--color-success-dim);border:1px solid var(--color-success-dim);border-radius:6px;padding:10px 12px;font-size:14px;font-weight:700;font-family:monospace;color:var(--color-accent)">
                  {{ autoChildren ?? '—' }}
                </div>
              </div>
            </div>

            <hr class="divider" />

            <div class="manual-grid">
              <div class="field-group">
                <label class="field-label">Evacuees</label>
                <input type="number" v-model="form.evacuees" placeholder="0" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Injured</label>
                <input type="number" v-model="form.injured" placeholder="0" min="0" class="field-input" />
              </div>
            </div>
          </div>

          <!-- Report Summary -->
          <div class="card summary-card">
            <div class="card-title"><ClipboardList :size="14" style="display:inline; margin-right:6px;" /> Report Summary</div>

            <div class="summary-list">
              <div v-for="([k,v]) in summaryRows" :key="k" class="summary-row">
                <span class="summary-key">{{ k }}</span>
                <span class="summary-val">{{ v || '—' }}</span>
              </div>
            </div>

            <!-- Supply Estimates -->
            <div class="supply-section">
              <div class="supply-header"><Package :size="14" style="display:inline; margin-right:6px;" /> Estimated Relief Supplies Needed</div>
              <div class="supply-grid">
                <div v-for="s in supplyItems" :key="s.label" class="supply-card" :style="{ borderColor: s.color+'33' }">
                  <component :is="s.icon" :size="20" :color="s.color" />
                  <div>
                    <div class="supply-label">{{ s.label }}</div>
                    <div class="supply-val mono" :style="{ color: s.value > 0 ? s.color : 'var(--text-secondary)' }">
                      {{ s.value }} <span class="supply-unit">{{ s.unit }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="noSupplies" class="supply-empty">
                No supply needs recorded yet. Add needs to residents in the Resident List.
              </div>
            </div>

            <div class="submit-notice">
              <AlertTriangle :size="14" style="display:inline; margin-right:6px;" /> Submitting sends this report directly to the
              <strong style="color:var(--color-warn)">LGU Operations Center</strong> for review and relief allocation.
            </div>

            <button class="btn-primary full-w" :disabled="!form.desc.trim()" @click="submit">
              <Send :size="16" /> Submit Report to LGU <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Users, 
  ClipboardList, 
  Package, 
  Box, 
  Droplet, 
  Stethoscope, 
  Bed, 
  Send, 
  ArrowRight 
} from 'lucide-vue-next'

const props = defineProps({
  user:      { type: Object, required: true },
  residents: { type: Array, default: () => [] },
  reports:   { type: Array, default: () => [] },
})
const emit = defineEmits(['navigate'])

// ── Constants ──────────────────────────────────────────────────────────────────
const DISASTER_TYPES = ['Flood','Typhoon','Landslide','Earthquake','Fire','Storm Surge','Drought','Volcanic Eruption']
const SEVERITIES     = ['Low','Moderate','High','Critical']

// ── State ─────────────────────────────────────────────────────────────────────
const done         = ref(false)
const submittedRef = ref('')
const today        = new Date().toISOString().split('T')[0]
const form = reactive({
  barangay: props.user.name || 'Barangay Riverside', municipality: props.user.muni || 'Butuan City',
  dtype:'Flood', severity:'Moderate', evacuees:'', injured:'', date:today, desc:''
})

// ── Auto-calculated ────────────────────────────────────────────────────────────
const autoFamilies    = computed(() => props.residents.length)
const autoIndividuals = computed(() => props.residents.reduce((s,r) => s + (r.members ? r.members.length : 0), 0))
const autoElderly     = computed(() => props.residents.reduce((s,r) => s + (r.members ? r.members.filter(m => parseInt(m.age) > 60).length : 0), 0))
const autoChildren    = computed(() => props.residents.reduce((s,r) => s + (r.members ? r.members.filter(m => { const a=parseInt(m.age); return !isNaN(a) && a<17 }).length : 0), 0))
const autoEvacuees    = computed(() => props.residents.filter(r => r.status === 'Evacuated').reduce((s,r) => s + (r.members ? r.members.length : 0), 0))
const autoMissing     = computed(() => props.residents.filter(r => r.status === 'Missing').reduce((s,r) => s + (r.members ? r.members.length : 0), 0))
const autoPregnant    = computed(() => props.residents.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.includes('Pregnant')).length)
const autoDisabled    = computed(() => props.residents.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.includes('Disabled')||r.vulnerableGroups&&r.vulnerableGroups.includes('PWD')).length)
const autoSoloParent  = computed(() => props.residents.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.includes('Solo Parent')).length)
const autoVulnFamilies= computed(() => props.residents.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.length>0).length)
const autoFoodPacks   = computed(() => props.residents.filter(r=>r.needs&&r.needs.includes('Food')).reduce((s,r)=>s+(r.members?r.members.length:0), 0))
const autoWaterLiters = computed(() => props.residents.filter(r=>r.needs&&r.needs.includes('Water')).reduce((s,r)=>s+(r.members?r.members.length:0)*3, 0))
const autoMedKits     = computed(() => props.residents.filter(r=>r.needs&&r.needs.includes('Medicine')).reduce((s,r)=>s+(r.members?r.members.length:0), 0))
const autoBlankets    = computed(() => props.residents.filter(r=>r.needs&&r.needs.includes('Blanket')).reduce((s,r)=>s+(r.members?r.members.length:0), 0))

// ── Summary ───────────────────────────────────────────────────────────────────
const summaryRows = computed(() => [
  ['Barangay',        form.barangay],
  ['Municipality',    form.municipality],
  ['Disaster Type',   form.dtype],
  ['Severity',        form.severity],
  ['Date',            form.date],
  ['Families',        autoFamilies.value],
  ['Total Individuals', autoIndividuals.value],
  ['Evacuees',        form.evacuees||0],
  ['Injured',         form.injured||0],
  ['Elderly (auto)',  autoElderly.value],
  ['Children (auto)', autoChildren.value],
])

const supplyItems = computed(() => [
  { icon: Box,         label:'Food Packs',   value:autoFoodPacks.value,   unit:'packs',  color:'var(--color-warn)' },
  { icon: Droplet,     label:'Water',         value:autoWaterLiters.value, unit:'liters', color:'var(--color-accent)' },
  { icon: Stethoscope, label:'Medicine Kits', value:autoMedKits.value,     unit:'kits',   color:'var(--color-danger)' },
  { icon: Bed,         label:'Blankets',      value:autoBlankets.value,    unit:'pcs',    color:'var(--color-success)' },
])
const noSupplies = computed(() => supplyItems.value.every(s => s.value === 0))

// ── Submit ────────────────────────────────────────────────────────────────────
const submit = async () => {
  if(!form.desc.trim()) return
  
  // Robust ID generation for real-time: find highest numeric ID or fallback to length+1
  const maxNum = props.reports.reduce((max, r) => {
    if (!r.id || !r.id.includes('-')) return max
    const num = parseInt(r.id.split('-')[1])
    return !isNaN(num) && num > max ? num : max
  }, 0)
  
  const genRef = `RPT-${String(maxNum + 1).padStart(3,'0')}`
  
  const newReport = {
    id: genRef,
    brgy: form.barangay, muni: form.municipality,
    dtype: form.dtype, severity: form.severity, urgency: 'Pending',
    families:    autoFamilies.value,
    individuals: autoIndividuals.value,
    evacuees:    parseInt(form.evacuees)||0,
    injured:     parseInt(form.injured)||0,
    elderly:     autoElderly.value,
    children:    autoChildren.value,
    desc: form.desc, status:'pending', date: form.date,
    foodNeeded: autoFoodPacks.value, waterNeeded: autoWaterLiters.value,
    medNeeded:  autoMedKits.value,   blanketNeeded: autoBlankets.value,
    vulnScore:0, verified:false,
    createdAt: new Date().toISOString()
  }
  
  await setDoc(doc(db, 'reports', genRef), newReport)

  submittedRef.value = genRef
  done.value = true
}

const reset = () => {
  done.value = false
  form.dtype='Flood'; form.severity='Moderate'; form.evacuees=''; form.injured=''; form.date=today; form.desc=''
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sevColor = s => ({ Low:'var(--color-success)', Moderate:'var(--color-warn)', High:'var(--color-high)', Critical:'var(--color-danger)' })[s] || 'var(--text-secondary)'
const sevDimColor = s => ({ Low:'var(--color-success-dim)', Moderate:'var(--color-warn-dim)', High:'var(--color-high-dim)', Critical:'var(--color-danger-dim)' })[s] || 'transparent'


</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.fade-up{animation:fadeUp .4s ease forwards}
.float{animation:float 3s ease-in-out infinite}
*{box-sizing:border-box;font-family:'Outfit','Segoe UI',sans-serif}

/* Page */
.page-header{margin-bottom:20px}
.portal-label{font-size:10px;color:var(--color-warn);font-family:monospace;letter-spacing:.12em;margin-bottom:4px}
.page-title{font-size:22px;font-weight:900;color:var(--text-primary)}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px;display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.auto-tag{font-size:10px;color:var(--color-success);background:var(--color-success-dim);border:1px solid var(--color-success-dim);border-radius:3px;padding:1px 7px;font-family:monospace;margin-left:6px}
.warn-banner{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--color-warn-dim);border:1px solid var(--color-warn-dim);border-radius:8px;margin-bottom:20px;font-size:13px;color:var(--color-warn)}

/* Layout */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.right-col{display:flex;flex-direction:column;gap:16px}
.card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:8px;padding:1.25rem}
.card-title{font-size:13px;font-weight:700;color:var(--color-warn);margin-bottom:16px}
.card-sub{font-size:11px;color:var(--text-secondary);margin-bottom:16px;margin-top:-10px}
.auto-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
.manual-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
.divider{height:1px;background:var(--border-color);border:none;margin:8px 0 16px}

/* Fields */
.field-group{margin-bottom:12px}
.field-label{display:block;font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.required{color:var(--color-danger)}
.field-input{width:100%;background:var(--bg-body);border:1px solid var(--border-color);border-radius:6px;padding:10px 12px;color:var(--text-primary);font-size:13px;outline:none;transition:border-color .2s}
.field-input:focus{border-color:var(--color-warn)}
.field-select{width:100%;background:var(--bg-body);border:1px solid var(--border-color);border-radius:6px;padding:10px 12px;color:var(--text-primary);font-size:13px;outline:none;appearance:none;cursor:pointer;transition:border-color .2s}
.field-select:focus{border-color:var(--color-warn)}
.field-textarea{width:100%;background:var(--bg-body);border:1px solid var(--border-color);border-radius:6px;padding:10px 12px;color:var(--text-primary);font-size:13px;outline:none;resize:vertical;transition:border-color .2s}
.field-textarea:focus{border-color:var(--color-warn)}

/* Severity */
.severity-row{display:flex;gap:8px}
.sev-btn{flex:1;padding:8px 4px;border-radius:6px;border:2px solid var(--border-color);background:transparent;color:var(--text-secondary);font-size:12px;font-weight:400;cursor:pointer;transition:all .15s;font-family:'Outfit',sans-serif}
.sev-btn.active{font-weight:700}

/* Summary */
.summary-card{border-color:var(--color-warn-dim)}
.summary-list{display:flex;flex-direction:column}
.summary-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border-color)}
.summary-key{font-size:12px;color:var(--text-secondary)}
.summary-val{font-size:12px;font-weight:700;font-family:monospace;color:var(--text-primary)}

/* Supply */
.supply-section{margin-top:14px}
.supply-header{font-size:11px;color:var(--text-secondary);font-family:monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.supply-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.supply-card{background:var(--bg-body);border:1px solid var(--text-secondary)33;border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px}
.supply-label{font-size:10px;color:var(--text-secondary);margin-bottom:2px}
.supply-val{font-size:16px;font-weight:900;line-height:1}
.supply-unit{font-size:10px;font-weight:400;color:var(--text-secondary)}
.supply-empty{font-size:11px;color:var(--text-secondary);margin-top:8px;font-style:italic}
.mono{font-family:monospace}

/* Notice & Submit */
.submit-notice{margin-top:14px;padding:10px 14px;background:var(--color-warn-dim);border:1px solid var(--color-warn-dim);border-radius:6px;font-size:12px;color:var(--text-secondary)}
.btn-primary{background:var(--color-warn);color:var(--bg-body);border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s;font-family:'Outfit',sans-serif;margin-top:14px}
.btn-primary:hover:not(:disabled){opacity:.8}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-primary.full-w{width:100%;justify-content:center}
.btn-ghost{background:transparent;border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif}
.btn-ghost:hover{opacity:.8;background:var(--bg-body)}

/* Success */
.success-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px;text-align:center}
.success-icon{font-size:64px}
.success-title{font-size:22px;font-weight:900;color:var(--color-success)}
.success-sub{font-size:14px;color:var(--text-secondary);max-width:440px;line-height:1.8}
.ref-box{background:var(--bg-surface);border:1px solid var(--color-warn-dim);border-radius:10px;padding:1.2rem 2.5rem}
.ref-label{font-size:10px;color:var(--text-secondary);font-family:monospace;letter-spacing:.1em;margin-bottom:4px}
.ref-val{font-size:24px;font-weight:900;color:var(--color-warn);font-family:monospace}
</style>