<template>
  <div class="fade-up">

    <!-- ── PAGE HEADER ── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Disaster Reports</h1>
        <p class="page-sub">All submitted barangay disaster reports</p>
      </div>
      <button class="btn-primary" @click="showForm = !showForm">
        + Submit New Report
      </button>
    </div>

    <!-- ── SUBMIT FORM (toggled) ── -->
    <div v-if="showForm" class="form-card">
      <div class="form-title">New Disaster Report</div>

      <!-- Row 1: Barangay + Municipality -->
      <div class="grid-2">
        <div class="field">
          <label class="field-label">Barangay Name</label>
          <input v-model="form.brgy" class="field-input" placeholder="e.g. Barangay Riverside" />
        </div>
        <div class="field">
          <label class="field-label">Municipality</label>
          <input v-model="form.muni" class="field-input" placeholder="e.g. Butuan City" />
        </div>
      </div>

      <!-- Disaster Type select -->
      <div class="field">
        <label class="field-label">Disaster Type</label>
        <select v-model="form.dtype" class="field-input field-select">
          <option v-for="opt in disasterTypes" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <!-- Description textarea -->
      <div class="field">
        <label class="field-label">Disaster Description</label>
        <textarea v-model="form.desc" class="field-input field-textarea" rows="3"
          placeholder="Describe the situation in detail..." />
      </div>

      <!-- Row 2: Families / Individuals / Evacuees / Injured -->
      <div class="grid-4">
        <div class="field">
          <label class="field-label">Families</label>
          <input v-model="form.families" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Individuals</label>
          <input v-model="form.individuals" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Evacuees</label>
          <input v-model="form.evacuees" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Injured</label>
          <input v-model="form.injured" type="number" class="field-input" placeholder="0" />
        </div>
      </div>

      <!-- Row 3: Vulnerable groups -->
      <div class="grid-4">
        <div class="field">
          <label class="field-label">Elderly</label>
          <input v-model="form.elderly" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Children</label>
          <input v-model="form.children" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Pregnant</label>
          <input v-model="form.pregnant" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Disabled</label>
          <input v-model="form.disabled" type="number" class="field-input" placeholder="0" />
        </div>
      </div>

      <!-- Form actions -->
      <div class="form-actions">
        <button class="btn-primary" @click="submitReport">Submit Report</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <!-- ── REPORT CARDS LIST ── -->
    <div class="report-list">
      <div v-for="r in reports" :key="r.id" class="report-card">

        <!-- Left: severity color bar -->
        <div class="sev-bar" :style="{ background: sevColor(r.severity) }" />

        <!-- Middle: report info -->
        <div class="report-body">
          <div class="report-top">
            <span class="report-name">{{ r.brgy }}</span>
            <span class="badge" :style="badgeStyle('var(--color-accent)')">{{ r.dtype }}</span>
            <span v-if="r.aiAnalysis" class="badge" style="background:color-mix(in srgb, var(--color-accent), transparent 90%); border:1px solid color-mix(in srgb, var(--color-accent), transparent 73%); color:var(--color-accent); display: inline-flex; align-items: center; gap: 4px;">
              <Brain :size="12" /> AI ANALYZED
            </span>
            <span class="badge" :style="badgeStyle(statusColor(r.status))">{{ (r.status || 'pending').toUpperCase() }}</span>
            <span class="report-id" style="margin-left:auto;color:var(--text-secondary);font-size:10px;">{{ r.id }}</span>
          </div>
          <div class="report-meta">
            {{ r.muni }} · {{ (r.individuals || 0).toLocaleString() }} individuals · {{ r.evacuees || 0 }} evacuees · {{ r.date }}
          </div>
        </div>

        <!-- Right: AI Analysis button -->
        <div class="report-actions">
          <button class="btn-ghost" style="padding: 5px 14px; font-size: 12px;"
            @click="$emit('navigate', 'analysis')">
            AI Analysis →
          </button>
        </div>

      </div>

      <!-- Empty state -->
      <div v-if="reports.length === 0" class="empty-state">
        No disaster reports submitted yet.
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref } from 'vue'
import { Brain } from 'lucide-vue-next'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

// ─── PROPS & EMITS ────────────────────────────────────────────────────────────
const props = defineProps({
  reports: { type: Array, required: true },
})
const emit = defineEmits(['navigate'])

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const sevColor    = (s) => ({ Critical: 'var(--color-danger)', High: 'var(--color-high)', Moderate: 'var(--color-warn)', Low: 'var(--color-success)' })[s] || 'var(--text-secondary)'
const statusColor = (s) => ({ pending: 'var(--color-warn)', approved: 'var(--color-accent)', distributed: 'var(--color-success)', rejected: 'var(--color-danger)' })[s] || 'var(--text-secondary)'
const badgeStyle  = (color) => ({ 
  background: `color-mix(in srgb, ${color}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${color}, transparent 70%)`, 
  color 
})

// ─── FORM STATE ───────────────────────────────────────────────────────────────
// showForm toggles the new report form open/closed
const showForm = ref(false)

// Blank form template — reset to this after each submission
const blankForm = () => ({
  brgy: '', muni: '', dtype: 'Flood', desc: '',
  families: '', individuals: '', evacuees: '', injured: '',
  elderly: '', children: '', pregnant: '', disabled: '',
})

const form = ref(blankForm())

// ─── DISASTER TYPES ───────────────────────────────────────────────────────────
const disasterTypes = ['Flood', 'Typhoon', 'Landslide', 'Earthquake', 'Fire', 'Storm Surge']

// ─── SUBMIT REPORT ────────────────────────────────────────────────────────────
// Validates, builds the new report object, adds it to the list, resets the form
async function submitReport() {
  if (!form.value.brgy || !form.value.desc) {
    alert('Barangay name and description are required.')
    return
  }

  const newId = `RPT-${String(props.reports.length + 4).padStart(3, '0')}`
  const newReport = {
    id:          newId,
    brgy:        form.value.brgy,
    muni:        form.value.muni,
    dtype:       form.value.dtype,
    desc:        form.value.desc,
    families:    parseInt(form.value.families)    || 0,
    individuals: parseInt(form.value.individuals) || 0,
    evacuees:    parseInt(form.value.evacuees)    || 0,
    injured:     parseInt(form.value.injured)     || 0,
    elderly:     parseInt(form.value.elderly)     || 0,
    children:    parseInt(form.value.children)    || 0,
    pregnant:    parseInt(form.value.pregnant)    || 0,
    disabled:    parseInt(form.value.disabled)    || 0,
    severity:    'Pending',
    urgency:     'Pending',
    status:      'pending',
    date:        new Date().toISOString().split('T')[0],
    foodNeeded:  0,
    waterNeeded: 0,
    medNeeded:   0,
    vulnScore:   0,
  }

  try {
    await setDoc(doc(db, 'reports', newId), newReport)
    form.value = blankForm()
    showForm.value = false
    alert('Report submitted. Run AI Analysis to process it.')
  } catch (error) {
    console.error("Error submitting report:", error)
    alert("Failed to submit report.")
  }
}
</script>


<style scoped>
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.fade-up { animation: fadeUp 0.4s ease forwards; }

/* ── PAGE HEADER ── */
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-title  { font-size:22px; font-weight:800; }
.page-sub    { color:var(--text-secondary); font-size:13px; margin-top:4px; }

/* ── BUTTONS ── */
.btn-primary {
  background: var(--color-accent); color: var(--bg-body);
  border: none; border-radius: 4px;
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity .2s;
  font-family: 'Outfit', sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary:hover { opacity: 0.85; }

.btn-ghost {
  background: transparent; border: 1px solid var(--border-color);
  color: var(--text-primary); border-radius: 4px;
  padding: 8px 20px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s;
  font-family: 'Outfit', sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-ghost:hover { border-color: color-mix(in srgb, var(--color-accent), transparent 73%); color: var(--color-accent); }

/* ── FORM CARD ── */
.form-card {
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--color-accent), transparent 73%);
  border-radius: 6px;
  padding: 1.25rem;
  margin-bottom: 20px;
}
.form-title   { font-size:14px; font-weight:700; color:var(--color-accent); margin-bottom:16px; }
.form-actions { display:flex; gap:10px; margin-top:8px; }

/* ── FORM FIELDS ── */
.field        { margin-bottom: 12px; }
.field-label  {
  display: block; font-size: 11px; color: var(--text-secondary);
  font-family: 'DM Mono', monospace; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 4px;
}
.field-input  {
  width: 100%; background: var(--bg-body);
  border: 1px solid var(--border-color); border-radius: 4px;
  padding: 8px 12px; color: var(--text-primary); font-size: 13px;
  transition: border-color .2s; font-family: 'Outfit', sans-serif;
  outline: none;
}
.field-input:focus   { border-color: var(--color-accent); }
.field-select        { appearance: none; cursor: pointer; }
.field-textarea      { resize: vertical; }

/* ── GRID LAYOUTS ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr;        gap: 0 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 12px; }

/* ── REPORT LIST ── */
.report-list { display: flex; flex-direction: column; gap: 10px; }

.report-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color .2s;
}
.report-card:hover { border-color: color-mix(in srgb, var(--border-color), transparent 47%); }

/* Left severity bar */
.sev-bar  { width: 4px; height: 50px; border-radius: 2px; flex-shrink: 0; }

/* Report body */
.report-body { flex: 1; }
.report-top  { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
.report-name { font-size: 14px; font-weight: 700; }
.report-meta { font-size: 12px; color: var(--text-secondary); }

/* Right action area */
.report-actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ── BADGE ── */
.badge {
  display: inline-block; padding: 2px 10px;
  font-size: 11px; font-family: 'DM Mono', monospace;
  letter-spacing: 0.06em; border-radius: 2px;
  font-weight: 500; white-space: nowrap;
}

/* ── EMPTY STATE ── */
.empty-state {
  text-align: center; padding: 4rem;
  color: var(--text-secondary); font-size: 13px;
  background: var(--bg-surface); border: 1px solid var(--border-color);
  border-radius: 6px;
}
</style>
