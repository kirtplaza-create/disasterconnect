<template>
  <div class="fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Transparent Donation Tracking</h1>
        <p class="page-sub">Full visibility of all incoming donations — who gave what, when, and where it went</p>
      </div>
      <button class="btn-primary" @click="showForm = !showForm">+ Log Donation</button>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-value" style="color:var(--color-accent);">{{ donations.length }}</div><div class="stat-label">Total Donations</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--color-success);">{{ receivedCount }}</div><div class="stat-label">Received</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--color-accent);">{{ inTransitCount }}</div><div class="stat-label">In Transit</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--color-warn);">{{ totalItemsDonated.toLocaleString() }}</div><div class="stat-label">Total Items Donated</div></div>
    </div>

    <!-- Log form -->
    <div v-if="showForm" class="form-card">
      <div class="form-title">Log New Donation</div>
      <div class="grid-3">
        <div class="field"><label class="field-label">Donor Name</label><input v-model="form.donor" class="field-input" placeholder="Person, org, or anonymous" /></div>
        <div class="field">
          <label class="field-label">Donor Type</label>
          <select v-model="form.type" class="field-input field-select">
            <option v-for="t in ['Government','NGO','Private','Individual']" :key="t">{{ t }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">Contact Person</label><input v-model="form.contact" class="field-input" placeholder="Contact name" /></div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label class="field-label">For Disaster Report</label>
          <select v-model="form.reportId" class="field-input field-select">
            <option v-for="r in reports" :key="r.id" :value="r.id">{{ r.id }} — {{ r.brgy }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">Estimated Value (PHP)</label><input v-model="form.totalValue" class="field-input" placeholder="e.g. ₱50,000" /></div>
      </div>
      <div class="field"><label class="field-label">Notes</label><input v-model="form.notes" class="field-input" placeholder="Additional notes about this donation" /></div>

      <!-- Donated items -->
      <div class="field-label" style="margin-bottom:8px;">DONATED ITEMS</div>
      <div v-for="(it, i) in form.items" :key="i" class="item-row">
        <input v-model="it.name" class="field-input" placeholder="Item name" style="flex:2;" />
        <input v-model="it.qty" type="number" class="field-input" placeholder="Qty" style="flex:1;" />
        <select v-model="it.unit" class="field-input field-select" style="flex:1;">
          <option v-for="u in ['packs','liters','kits','pcs','tents','boxes','sacks']" :key="u">{{ u }}</option>
        </select>
        <button class="remove-btn" @click="removeItem(i)" style="display: flex; align-items: center; justify-content: center; padding: 6px;">
          <X :size="14" />
        </button>
      </div>
      <button class="add-item-btn" @click="addDonationItem">+ Add Item</button>

      <div style="display:flex;gap:10px;margin-top:12px;">
        <button class="btn-primary" @click="submitDonation">Log Donation</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button v-for="f in filters" :key="f.id" class="filter-tab"
        :style="{ borderBottomColor: activeFilter === f.id ? 'var(--color-accent)' : 'transparent', color: activeFilter === f.id ? 'var(--color-accent)' : 'var(--text-secondary)', fontWeight: activeFilter === f.id ? 700 : 400 }"
        @click="activeFilter = f.id">
        {{ f.label }}
      </button>
    </div>

    <!-- Donation cards -->
    <div class="card-list">
      <div v-for="don in filtered" :key="don.id" class="donation-card">
        <div class="type-bar" :style="{ background: typeColor(don.type) }" />
        <div style="flex:1;">
          <div class="don-header">
            <span class="don-name">{{ don.donor }}</span>
            <span class="badge" :style="badgeStyle(typeColor(don.type))">{{ don.type }}</span>
            <span class="badge" :style="badgeStyle(statusColor(don.status))">{{ (don.status || 'pending').toUpperCase() }}</span>
            <span class="don-meta" style="margin-left:auto;">{{ don.id }} · {{ don.date }}</span>
          </div>
          <!-- Items -->
          <div class="item-tags">
            <div v-for="(it, i) in (don.items||[])" :key="i" class="item-tag">
              <span style="color:var(--color-accent);font-weight:600;">{{ it.qty?.toLocaleString() }}</span>
              <span style="color:var(--text-secondary);"> {{ it.unit }} </span>
              <span>{{ it.name }}</span>
            </div>
          </div>
          <!-- Meta row -->
          <div class="don-footer">
            <span v-if="don.totalValue" style="color:var(--color-success);font-weight:600;">{{ don.totalValue }}</span>
            <span v-if="don.contact && don.contact !== '—'" class="don-meta">Contact: {{ don.contact }}</span>
            <span v-if="linkedReport(don.reportId)" class="don-meta">For: <span style="color:var(--color-accent);">{{ linkedReport(don.reportId)?.brgy }}</span></span>
            <span v-if="don.notes" class="don-meta" style="font-style:italic;">{{ don.notes }}</span>
          </div>
        </div>
        <!-- Status actions -->
        <div class="don-actions">
          <template v-if="don.status === 'pending'">
            <button class="btn-ghost-sm" @click="updateStatus(don.id, 'in-transit')">Mark In-Transit</button>
            <button class="btn-ghost-sm" @click="updateStatus(don.id, 'received')">Mark Received</button>
          </template>
          <button v-if="don.status === 'in-transit'" class="btn-success-sm" @click="updateStatus(don.id, 'received')" style="display: flex; align-items: center; gap: 4px;">
            <Check :size="14" /> Confirm Received
          </button>
          <span v-if="don.status === 'received'" style="font-size:11px;color:var(--color-success);font-family:'DM Mono',monospace; display: flex; align-items: center; gap: 4px;">
            <Check :size="14" /> Received
          </span>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="empty-state">No donations found for this filter.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { X, Check } from 'lucide-vue-next'

const props = defineProps({ donations: { type: Array, required: true }, reports: { type: Array, required: true } })

const showForm   = ref(false)
const activeFilter = ref('all')

const blankForm = () => ({ donor:'', type:'Government', contact:'', reportId: props.reports[0]?.id || '', notes:'', totalValue:'', items:[{name:'',qty:'',unit:'packs'}] })
const form = ref(blankForm())

const typeColor   = (t) => ({ Government:'var(--color-accent)', NGO:'var(--color-success)', Private:'var(--color-high)', Individual:'var(--color-warn)' })[t] || 'var(--text-secondary)'
const statusColor = (s) => ({ received:'var(--color-success)', 'in-transit':'var(--color-accent)', pending:'var(--color-warn)', rejected:'var(--color-danger)' })[s] || 'var(--text-secondary)'
const badgeStyle  = (c) => ({ 
  background: `color-mix(in srgb, ${c}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${c}, transparent 70%)`, 
  color: c 
})

const receivedCount    = computed(() => props.donations.filter(d => d.status === 'received').length)
const inTransitCount   = computed(() => props.donations.filter(d => d.status === 'in-transit').length)
const totalItemsDonated= computed(() => props.donations.reduce((s,d) => s + (d.items||[]).reduce((ss,i) => ss + (i.qty||0), 0), 0))

const filters = computed(() => [
  { id:'all',        label:`All (${props.donations.length})` },
  { id:'received',   label:`Received (${props.donations.filter(d=>d.status==='received').length})` },
  { id:'in-transit', label:`In-Transit (${props.donations.filter(d=>d.status==='in-transit').length})` },
  { id:'pending',    label:`Pending (${props.donations.filter(d=>d.status==='pending').length})` },
])

const filtered = computed(() => activeFilter.value === 'all' ? props.donations : props.donations.filter(d => d.status === activeFilter.value))
const linkedReport = (id) => props.reports.find(r => r.id === id)

function addDonationItem() { form.value.items.push({ name:'', qty:'', unit:'packs' }) }
function removeItem(i) { form.value.items.splice(i, 1) }

async function submitDonation() {
  if (!form.value.donor) return alert('Donor name required.')
  
  const newId = `DON-${String(props.donations.length + 1).padStart(3,'0')}`
  const newDonation = {
    id: newId,
    ...form.value,
    items: form.value.items.filter(i => i.name).map(i => ({ ...i, qty: parseInt(i.qty)||0 })),
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
  }

  try {
    await setDoc(doc(db, 'donations', newId), newDonation)
    showForm.value = false
    form.value = blankForm()
  } catch (error) {
    console.error("Error logging donation:", error)
    alert("Failed to log donation.")
  }
}

async function updateStatus(id, status) {
  try {
    await updateDoc(doc(db, 'donations', id), { status })
    
    // If received, add to inventory
    if (status === 'received') {
      const don = props.donations.find(d => d.id === id)
      if (!don || !don.items) return
      
      for (const item of don.items) {
        // Find existing inventory item by name (case insensitive)
        const invItem = props.inventory.find(i => 
          i.item.toLowerCase() === item.name.toLowerCase()
        )
        
        if (invItem) {
          // Update existing
          const newQty = (invItem.available || 0) + (item.qty || 0)
          await updateDoc(doc(db, 'inventory', invItem.id), {
            available: newQty,
            low: newQty < 50
          })
        } else {
          // Create new inventory item
          // Robust ID generation for real-time: find highest numeric ID
          const maxNum = props.inventory.reduce((max, i) => {
            if (!i.id || !i.id.includes('-')) return max
            const num = parseInt(i.id.split('-')[1])
            return !isNaN(num) && num > max ? num : max
          }, 0)
          const newInvId = `INV-${String(maxNum + 1).padStart(3,'0')}`
          
          await setDoc(doc(db, 'inventory', newInvId), {
            id: newInvId,
            item: item.name,
            available: item.qty || 0,
            unit: item.unit || 'packs',
            warehouse: 'WH-Central',
            low: (item.qty || 0) < 50,
            createdAt: new Date().toISOString()
          })
        }
      }
    }
  } catch (error) {
    console.error("Error updating donation status/syncing inventory:", error)
    alert("Failed to update status and sync inventory.")
  }
}
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.page-title{font-size:22px;font-weight:800}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat-box{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:1.2rem;text-align:center}
.stat-value{font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1;margin-bottom:4px}
.stat-label{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
.form-card{background:var(--bg-surface); border:1px solid color-mix(in srgb, var(--color-accent), transparent 73%); border-radius:6px; padding:1.25rem; margin-bottom:20px}
.form-title{font-size:14px; font-weight:700; color:var(--color-accent); margin-bottom:14px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:0 14px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.field{margin-bottom:12px}
.field-label{display:block;font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.field-input{width:100%;background:var(--bg-body);border:1px solid var(--border-color);border-radius:4px;padding:8px 12px;color:var(--text-primary);font-size:13px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.field-input:focus{border-color:var(--color-accent)}
.field-select{appearance:none;cursor:pointer}
.item-row{display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center}
.remove-btn{background:color-mix(in srgb, var(--color-danger), transparent 90%); border:1px solid color-mix(in srgb, var(--color-danger), transparent 73%); color:var(--color-danger); border-radius:4px; padding:6px 10px; font-size:12px; cursor:pointer}
.add-item-btn{background:none; border:1px dashed var(--border-color); color:var(--text-secondary); border-radius:4px; padding:6px 16px; font-size:12px; cursor:pointer; width:100%; margin-top:4px}
.add-item-btn:hover{border-color:color-mix(in srgb, var(--color-accent), transparent 73%); color:var(--color-accent)}
.btn-primary{background:var(--color-accent);color:var(--bg-body);border:none;border-radius:4px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;padding:9px 20px;font-size:13px;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif}
.btn-ghost:hover{border-color:var(--color-accent)44;color:var(--color-accent)}
.filter-tabs{display:flex;border-bottom:1px solid var(--border-color);margin-bottom:16px}
.filter-tab{padding:8px 18px;background:none;border:none;border-bottom:2px solid transparent;font-size:12px;cursor:pointer;margin-bottom:-1px;letter-spacing:.03em;transition:all .15s;font-family:'Outfit',sans-serif}
.card-list{display:flex;flex-direction:column;gap:10px}
.donation-card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:1.25rem;display:flex;align-items:flex-start;gap:16px}
.type-bar{width:4px;min-height:60px;border-radius:2px;flex-shrink:0;margin-top:2px}
.don-header{display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap}
.don-name{font-size:14px;font-weight:700}
.don-meta{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace}
.item-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.item-tag{background:var(--bg-body);border:1px solid var(--border-color);border-radius:4px;padding:3px 10px;font-size:12px;font-family:'DM Mono',monospace}
.don-footer{display:flex;gap:20px;flex-wrap:wrap;font-size:12px}
.don-actions{display:flex;flex-direction:column;gap:6px;flex-shrink:0}
.btn-ghost-sm{background:transparent;border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;padding:4px 12px;font-size:11px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'Outfit',sans-serif}
.btn-ghost-sm:hover{border-color:color-mix(in srgb, var(--color-accent), transparent 73%); color:var(--color-accent)}
.btn-success-sm{background:color-mix(in srgb, var(--color-success), transparent 90%); border:1px solid color-mix(in srgb, var(--color-success), transparent 73%); color:var(--color-success); border-radius:4px; padding:4px 12px; font-size:11px; cursor:pointer; font-family:'Outfit',sans-serif}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
.empty-state{text-align:center;padding:3rem;color:var(--text-secondary);font-size:13px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px}
</style>