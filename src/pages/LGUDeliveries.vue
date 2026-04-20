<template>
  <div class="fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Delivery Status & Monitoring</h1>
        <p class="page-sub">Track every relief delivery from dispatch to confirmed arrival</p>
      </div>
      <button class="btn-primary" @click="showForm = !showForm">+ Create Delivery</button>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-value" style="color:var(--color-accent);">{{ deliveries.length }}</div><div class="stat-label">Total Deliveries</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--text-secondary);">{{ counts.pending }}</div><div class="stat-label">Pending Dispatch</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--color-warn);">{{ (counts.dispatched||0) + (counts['in-transit']||0) }}</div><div class="stat-label">In Transit</div></div>
      <div class="stat-box"><div class="stat-value" style="color:var(--color-success);">{{ counts.delivered||0 }}</div><div class="stat-label">Delivered</div></div>
    </div>

    <!-- Create form -->
    <div v-if="showForm" class="form-card">
      <div class="form-title">Create Delivery Order</div>
      <div class="grid-2">
        <div class="field">
          <label class="field-label">Destination Report</label>
          <select v-model="form.reportId" class="field-input field-select">
            <option v-for="r in reports" :key="r.id" :value="r.id">{{ r.id }} — {{ r.brgy }}, {{ r.muni }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">Driver Name</label><input v-model="form.driver" class="field-input" placeholder="Full name of driver" /></div>
      </div>
      <div class="grid-2">
        <div class="field"><label class="field-label">Vehicle (Plate No.)</label><input v-model="form.vehicle" class="field-input" placeholder="e.g. Truck — ABC 1234" /></div>
        <div class="field"><label class="field-label">Receiving Officer</label><input v-model="form.recipient" class="field-input" placeholder="Who will sign for it" /></div>
      </div>
      <div class="field"><label class="field-label">Notes / Instructions</label><input v-model="form.notes" class="field-input" placeholder="Route info, special instructions..." /></div>

      <div class="field-label" style="margin-bottom:8px;">ITEMS TO DELIVER</div>
      <div v-for="(it, i) in form.items" :key="i" class="item-row">
        <input v-model="it.name" class="field-input" placeholder="Item name" style="flex:2;" />
        <input v-model="it.qty" type="number" class="field-input" placeholder="Qty" style="flex:1;" />
        <select v-model="it.unit" class="field-input field-select" style="flex:1;">
          <option v-for="u in ['packs','liters','kits','pcs','tents','boxes']" :key="u">{{ u }}</option>
        </select>
        <button class="remove-btn" @click="form.items.splice(i,1)" style="display: flex; align-items: center; justify-content: center; padding: 6px;">
          <X :size="14" />
        </button>
      </div>
      <button class="add-item-btn" @click="form.items.push({name:'',qty:'',unit:'packs'})">+ Add Item</button>

      <div style="display:flex;gap:10px;margin-top:12px;">
        <button class="btn-primary" @click="submitDelivery">Create Delivery</button>
        <button class="btn-ghost" @click="showForm = false">Cancel</button>
      </div>
    </div>

    <!-- Delivery cards -->
    <div class="card-list">
      <div v-for="del in deliveries" :key="del.id" class="delivery-card">
        <div class="status-bar" :style="{ background: statusColor(del.status) }" />
        <div style="flex:1;">
          <!-- Header -->
          <div class="del-header">
            <component :is="statusIcon[del.status]" :size="18" class="del-icon" />
            <span class="del-name">{{ del.brgy }}</span>
            <span class="badge" :style="badgeStyle(statusColor(del.status))">{{ (del.status || 'pending').toUpperCase().replace('-',' ') }}</span>
            <span class="del-id">{{ del.id }}</span>
          </div>

          <!-- Progress pipeline -->
          <div class="pipeline-wrap">
            <div v-for="(s, i) in statusFlow" :key="s" style="display:flex;align-items:center;flex:1;">
              <div class="pipe-node" :style="{
                background: i <= currentStep(del) ? statusColor(del.status) : 'var(--border-color)',
                border: `2px solid ${i <= currentStep(del) ? statusColor(del.status) : 'var(--border-color)'}`,
                color: i <= currentStep(del) ? 'var(--bg-body)' : 'var(--text-secondary)',
              }">
                <Check v-if="i <= currentStep(del)" :size="10" />
                <span v-else>{{ i+1 }}</span>
              </div>
              <div class="pipe-line" :style="{ background: i < currentStep(del) ? statusColor(del.status) : 'var(--border-color)' }" />
            </div>
          </div>
          <div class="pipe-labels">
            <span v-for="s in statusFlow" :key="s" class="pipe-label">{{ s }}</span>
          </div>

          <!-- Details -->
          <div class="del-details">
            <span class="del-detail"><User :size="14" style="margin-right: 4px;" /> <span class="detail-val">{{ del.driver }}</span></span>
            <span class="del-detail"><Truck :size="14" style="margin-right: 4px;" /> <span class="detail-val">{{ del.vehicle }}</span></span>
            <span class="del-detail"><MapPin :size="14" style="margin-right: 4px;" /> <span class="detail-val">{{ del.recipient }}</span></span>
            <span v-if="del.dispatchTime" class="del-detail"><Send :size="14" style="margin-right: 4px;" /> <span class="detail-val">{{ del.dispatchTime }}</span></span>
            <span v-if="del.arrivalTime" style="font-size:12px;color:var(--color-success); display: flex; align-items: center; gap: 4px;">
              <CheckCircle :size="14" /> Arrived: <strong>{{ del.arrivalTime }}</strong>
            </span>
          </div>

          <!-- Items -->
          <div class="item-tags">
            <div v-for="(it,i) in del.items" :key="i" class="item-tag">
              <span style="color:var(--color-accent);font-weight:600;">{{ it.qty?.toLocaleString() }}</span>
              <span style="color:var(--text-secondary);"> {{ it.unit }} </span>
              <span>{{ it.name }}</span>
            </div>
          </div>

          <div v-if="del.notes" class="del-notes" style="display: flex; gap: 8px; align-items: flex-start;">
            <FileText :size="14" style="flex-shrink: 0; margin-top: 2px;" />
            <span>{{ del.notes }}</span>
          </div>
        </div>

        <!-- Advance button -->
        <div v-if="del.status !== 'delivered'" style="flex-shrink:0;">
          <button class="btn-advance" :class="del.status === 'in-transit' ? 'btn-success' : 'btn-primary'" @click="advanceStatus(del.id)">
            {{ nextLabel[del.status] }} →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { X, Clock, Package, Truck, CheckCircle, Check, User, MapPin, Send, FileText } from 'lucide-vue-next'

const props = defineProps({ deliveries:{ type:Array, required:true }, reports:{ type:Array, required:true } })

const showForm = ref(false)
const statusFlow = ['pending','dispatched','in-transit','delivered']
const statusIcon = { pending: Clock, dispatched: Package, 'in-transit': Truck, delivered: CheckCircle }
const nextLabel  = { pending:'Dispatch', dispatched:'Mark In-Transit', 'in-transit':'Confirm Delivered' }

const statusColor = (s) => ({ pending:'var(--text-secondary)', dispatched:'var(--color-warn)', 'in-transit':'var(--color-accent)', delivered:'var(--color-success)' })[s] || 'var(--text-secondary)'
const badgeStyle  = (c) => ({ 
  background: `color-mix(in srgb, ${c}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${c}, transparent 70%)`, 
  color: c 
})
const currentStep = (del) => statusFlow.indexOf(del.status)

const counts = computed(() => {
  const list = props.deliveries || []
  return statusFlow.reduce((acc,s) => ({ ...acc, [s]: list.filter(d=>d.status===s).length }), {})
})

const blankForm = () => ({ reportId: props.reports[0]?.id||'', driver:'', vehicle:'', recipient:'', notes:'', items:[{name:'',qty:'',unit:'packs'}] })
const form = ref(blankForm())

// Auto-fill form when report is selected
watch(() => form.value.reportId, (newId) => {
  const rep = props.reports.find(r => r.id === newId)
  if (rep) {
    if (rep.status === 'pending') {
       alert(`Note: Report ${newId} is still PENDING. It is recommended to perform AI Analysis first.`)
    }
    // Pre-fill items based on needs
    const suggestedItems = []
    if (rep.foodNeeded)    suggestedItems.push({ name: 'Food Packs', qty: rep.foodNeeded, unit: 'packs' })
    if (rep.waterNeeded)   suggestedItems.push({ name: 'Drinking Water', qty: rep.waterNeeded, unit: 'liters' })
    if (rep.medNeeded)     suggestedItems.push({ name: 'Medicine Kits', qty: rep.medNeeded, unit: 'kits' })
    if (rep.blanketNeeded) suggestedItems.push({ name: 'Blankets', qty: rep.blanketNeeded, unit: 'pcs' })
    
    if (suggestedItems.length > 0) {
      form.value.items = suggestedItems
    }
  }
})

async function submitDelivery() {
  if (!form.value.driver || !form.value.vehicle) return alert('Driver and vehicle required.')
  
  const rep = props.reports.find(r => r.id === form.value.reportId)
  const newId = `DEL-${String(props.deliveries.length + 1).padStart(3,'0')}`
  const newDelivery = {
    id: newId,
    ...form.value,
    brgy: rep?.brgy || '',
    items: form.value.items.filter(i=>i.name).map(i=>({...i,qty:parseInt(i.qty)||0})),
    status: 'pending', dispatchTime: null, arrivalTime: null,
  }

  try {
    await setDoc(doc(db, 'deliveries', newId), newDelivery)
    showForm.value = false
    form.value = blankForm()
  } catch (error) {
    console.error("Error creating delivery:", error)
    alert("Failed to create delivery.")
  }
}

async function advanceStatus(id) {
  const delivery = props.deliveries.find(d => d.id === id)
  if (!delivery) return

  const now = new Date().toLocaleString('en-PH',{hour12:false}).replace(',',' ')
  const updates = {}

  if (delivery.status === 'pending') {
    updates.status = 'dispatched'
    updates.dispatchTime = now
  } else if (delivery.status === 'dispatched') {
    updates.status = 'in-transit'
  } else if (delivery.status === 'in-transit') {
    updates.status = 'delivered'
    updates.arrivalTime = now
  } else {
    return
  }

  try {
    await updateDoc(doc(db, 'deliveries', id), updates)
  } catch (error) {
    console.error("Error updating delivery status:", error)
    alert("Failed to update status.")
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
.btn-primary{background:var(--color-accent);color:var(--bg-body);border:none;border-radius:4px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;padding:9px 20px;font-size:13px;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif}
.btn-ghost:hover{border-color:var(--color-accent)44;color:var(--color-accent)}
.card-list{display:flex;flex-direction:column;gap:10px}
.delivery-card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:1.25rem;display:flex;align-items:flex-start;gap:16px}
.status-bar{width:4px;min-height:80px;border-radius:2px;flex-shrink:0;margin-top:2px}
.del-header{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap}
.del-icon{font-size:18px}
.del-name{font-size:14px;font-weight:700}
.del-id{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;margin-left:auto}
.pipeline-wrap{display:flex;align-items:center;margin-bottom:4px}
.pipe-node{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;font-weight:700}
.pipe-line{flex:1;height:2px}
.pipe-labels{display:flex;justify-content:space-between;margin-bottom:10px;padding-right:20px}
.pipe-label{font-size:9px;color:var(--text-secondary);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.04em}
.del-details{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:8px}
.del-detail{font-size:12px;color:var(--text-secondary)}
.detail-val{color:var(--text-primary)}
.item-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px}
.item-tag{background:var(--bg-body);border:1px solid var(--border-color);border-radius:4px;padding:3px 10px;font-size:12px;font-family:'DM Mono',monospace}
.del-notes{font-size:12px;color:var(--text-secondary);font-style:italic;margin-top:6px}
.btn-advance{border:none; border-radius:4px; padding:6px 14px; font-size:12px; cursor:pointer; font-family:'Outfit',sans-serif; font-weight:600}
.btn-success{background:color-mix(in srgb, var(--color-success), transparent 90%); border:1px solid color-mix(in srgb, var(--color-success), transparent 73%) !important; color:var(--color-success); }
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500;white-space:nowrap}
</style>
