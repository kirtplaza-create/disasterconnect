<template>
  <div class="fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Resource Inventory</h1>
        <p class="page-sub">Manage relief supplies and warehouse stock</p>
      </div>
      <button class="btn-primary" @click="showAdd = !showAdd">+ Add Stock</button>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value" style="color:#00D4FF;">{{ totalItems.toLocaleString() }}</div>
        <div class="stat-label">Total Items in Stock</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" :style="{ color: lowCount > 0 ? '#FF3B5C' : '#00E5A0' }">{{ lowCount }}</div>
        <div class="stat-label">Low Stock Alerts</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:#FFD23F;">{{ warehouseCount }}</div>
        <div class="stat-label">Warehouse Locations</div>
      </div>
    </div>

    <!-- Add form -->
    <div v-if="showAdd" class="form-card">
      <div class="form-title">Add Inventory</div>
      <div class="grid-4">
        <div class="field">
          <label class="field-label">Item Name</label>
          <input v-model="form.item" class="field-input" placeholder="e.g. Food Packs" />
        </div>
        <div class="field">
          <label class="field-label">Quantity</label>
          <input v-model="form.available" type="number" class="field-input" placeholder="0" />
        </div>
        <div class="field">
          <label class="field-label">Unit</label>
          <select v-model="form.unit" class="field-input field-select">
            <option v-for="u in units" :key="u">{{ u }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">Warehouse</label>
          <select v-model="form.warehouse" class="field-input field-select">
            <option v-for="w in warehouses" :key="w">{{ w }}</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn-primary" @click="addItem">Add to Inventory</button>
        <button class="btn-ghost" @click="showAdd = false">Cancel</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th v-for="h in ['ID','Item','Available','Unit','Warehouse','Status']" :key="h" class="th">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in inventory" :key="i.id" class="table-row">
            <td class="td mono muted">{{ i.id }}</td>
            <td class="td" style="font-weight:500;">{{ i.item }}</td>
            <td class="td mono" style="font-size:14px;font-weight:700;" :style="{ color: i.low ? '#FF3B5C' : '#00E5A0' }">{{ (i.available || 0).toLocaleString() }}</td>
            <td class="td muted">{{ i.unit }}</td>
            <td class="td">{{ i.warehouse }}</td>
            <td class="td">
              <span class="badge" :style="i.low ? 'background:#FF3B5C18;border:1px solid #FF3B5C44;color:#FF3B5C' : 'background:#00E5A018;border:1px solid #00E5A044;color:#00E5A0'">
                {{ i.low ? 'LOW STOCK' : 'ADEQUATE' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const props = defineProps({ inventory: { type: Array, required: true } })

const showAdd = ref(false)
const units = ['packs','liters','kits','pcs','tents','boxes']
const warehouses = ['WH-Central','WH-North','WH-South','WH-East']
const blankForm = () => ({ item: '', available: '', unit: 'packs', warehouse: 'WH-Central' })
const form = ref(blankForm())

const totalItems   = computed(() => props.inventory.reduce((s, i) => s + i.available, 0))
const lowCount     = computed(() => props.inventory.filter(i => i.low).length)
const warehouseCount = computed(() => new Set(props.inventory.map(i => i.warehouse)).size)

async function addItem() {
  if (!form.value.item || !form.value.available) return
  
  const qty = parseInt(form.value.available)
  
  // Robust ID generation for real-time: find highest numeric ID or fallback to count + 1
  const maxNum = props.inventory.reduce((max, i) => {
    if (!i.id || !i.id.includes('-')) return max
    const num = parseInt(i.id.split('-')[1])
    return !isNaN(num) && num > max ? num : max
  }, 0)
  
  const newId = `INV-${String(maxNum + 1).padStart(3,'0')}`
  
  const newItem = {
    id: newId,
    item: form.value.item, available: qty, unit: form.value.unit,
    warehouse: form.value.warehouse, low: qty < 50,
    createdAt: new Date().toISOString()
  }

  try {
    await setDoc(doc(db, 'inventory', newId), newItem)
    form.value = blankForm()
    showAdd.value = false
  } catch (error) {
    console.error("Error adding inventory item:", error)
    alert("Failed to add to inventory.")
  }
}
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease forwards}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.page-title{font-size:22px;font-weight:800}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.stat-box{background:#0D1219;border:1px solid #1A2535;border-radius:6px;padding:1.2rem;text-align:center}
.stat-value{font-size:28px;font-weight:900;font-family:'DM Mono',monospace;line-height:1;margin-bottom:4px}
.stat-label{font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
.form-card{background:#0D1219;border:1px solid #00D4FF44;border-radius:6px;padding:1.25rem;margin-bottom:16px}
.form-title{font-size:14px;font-weight:700;margin-bottom:12px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:0 12px}
.field{margin-bottom:12px}
.field-label{display:block;font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.field-input{width:100%;background:#060A0F;border:1px solid #1A2535;border-radius:4px;padding:8px 12px;color:#E2EAF4;font-size:13px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.field-input:focus{border-color:#00D4FF}
.field-select{appearance:none;cursor:pointer}
.btn-primary{background:#00D4FF;color:#060A0F;border:none;border-radius:4px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s;display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;border:1px solid #1A2535;color:#E2EAF4;border-radius:4px;padding:9px 20px;font-size:13px;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif}
.btn-ghost:hover{border-color:#00D4FF44;color:#00D4FF}
.card{background:#0D1219;border:1px solid #1A2535;border-radius:6px;padding:1.25rem}
.table{width:100%;border-collapse:collapse}
.table-head-row{border-bottom:1px solid #1A2535}
.th{text-align:left;padding:8px 12px;font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;font-weight:400;letter-spacing:.06em}
.table-row{border-bottom:1px solid #1A2535;transition:background .15s}
.table-row:hover{background:#1A253520}
.td{padding:10px 12px;font-size:13px;vertical-align:middle}
.mono{font-family:'DM Mono',monospace}
.muted{color:#4A6080}
.badge{display:inline-block;padding:2px 10px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.06em;border-radius:2px;font-weight:500}
</style>
