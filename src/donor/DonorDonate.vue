<template>
  <!-- Success screen -->
  <div v-if="submitted" class="fade-up success-screen">
    <div class="float" style="margin-bottom: 20px;"><Heart :size="64" color="#00E5A0" fill="#00E5A0" /></div>
    <div style="font-size:24px;font-weight:900;color:#00E5A0;">Thank You for Donating!</div>
    <div class="success-sub">Your donation has been logged and will be verified by the LGU Operations Center. You can track its status in "My Donations".</div>
    <div class="ref-box">
      <div class="ref-label">YOUR DONATION REFERENCE</div>
      <div class="ref-id">{{ submittedId }}</div>
    </div>
    <div style="display:flex;gap:12px;">
      <button class="btn-primary" @click="submitted=false"><HeartHandshake :size="18" /> Donate Again</button>
      <button class="btn-ghost" @click="$emit('navigate','donor-track')">View My Donations <ArrowRight :size="16" /></button>
    </div>
  </div>

  <div v-else class="fade-up">
    <div style="margin-bottom:20px;">
      <div class="portal-label">DONOR PORTAL</div>
      <h1 class="page-title">Make a Donation</h1>
      <p class="page-sub">Your donation will be tracked transparently from submission to delivery</p>
    </div>

    <div class="two-col">
      <!-- Left: donor info -->
      <div class="card">
        <div class="card-title">Your Information</div>
        <div class="field"><label class="field-label">Your Name / Organization *</label>
          <input v-model="form.donorName" class="field-input" placeholder="Full name or org name" @focus="focus" @blur="blur" /></div>
        <div class="field">
          <label class="field-label">Donor Type</label>
          <select v-model="form.type" class="field-input field-select" @focus="focus" @blur="blur">
            <option v-for="t in types" :key="t">{{ t }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">Contact Number</label>
          <input v-model="form.contact" class="field-input" placeholder="09XXXXXXXXX" @focus="focus" @blur="blur" /></div>
        <div class="field">
          <label class="field-label">Donate For</label>
          <select v-model="form.reportId" class="field-input field-select" @focus="focus" @blur="blur">
            <option v-for="r in reports" :key="r.id" :value="r.id">{{ r.brgy }} — {{ r.dtype }}</option>
          </select>
        </div>
        <div class="field"><label class="field-label">Message to the Community (optional)</label>
          <textarea v-model="form.message" rows="3" class="field-input" placeholder="Words of encouragement..." @focus="focus" @blur="blur" style="resize:vertical;"></textarea></div>
      </div>

      <!-- Right: items -->
      <div class="card">
        <div class="card-title">Donation Items</div>
        <div v-for="(it,i) in form.items" :key="i" class="item-row">
          <input v-model="it.name" class="field-input" placeholder="Item (e.g. Food Packs)" style="flex:2;" @focus="focus" @blur="blur" />
          <input v-model="it.qty" type="number" class="field-input" placeholder="Qty" style="flex:1;" @focus="focus" @blur="blur" />
          <select v-model="it.unit" class="field-input field-select" style="flex:1;" @focus="focus" @blur="blur">
            <option v-for="u in units" :key="u">{{ u }}</option>
          </select>
          <button class="remove-btn" @click="form.items.splice(i,1)"><X :size="14" /></button>
        </div>
        <button class="add-item-btn" @click="form.items.push({name:'',qty:'',unit:'packs'})"><Plus :size="12" /> Add Item</button>

        <!-- Quick add tags -->
        <div style="margin-top:12px;">
          <div class="field-label" style="margin-bottom:6px;">QUICK ADD</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <button v-for="name in quickItems" :key="name" class="quick-btn" @click="form.items.push({name,qty:'',unit:'packs'})"><Plus :size="10" /> {{ name }}</button>
          </div>
        </div>

        <button class="btn-primary" style="width:100%;justify-content:center;margin-top:16px;" @click="submitDonation"><HeartHandshake :size="18" /> Submit Donation</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { 
  Heart, 
  HeartHandshake, 
  ArrowRight, 
  Plus, 
  X 
} from 'lucide-vue-next'

const props = defineProps({ reports: Array, donations: Array, donateForReport: String })
const emit  = defineEmits(['navigate'])

const submitted  = ref(false)
const submittedId= ref('')
const types      = ['Individual','NGO','Private Company','Government','Anonymous']
const units      = ['packs','liters','kits','pcs','tents','boxes','sacks']
const quickItems = ['Food Packs','Drinking Water','Medical Kits','Blankets','Evacuation Tents']

const blankForm = () => ({ donorName:'', type:'Individual', contact:'', reportId: props.donateForReport || props.reports[0]?.id || '', message:'', items:[{name:'',qty:'',unit:'packs'}] })
const form = ref(blankForm())

watch(() => props.donateForReport, v => { if (v) form.value.reportId = v })

const focus = e => e.target.style.borderColor = '#00E5A0'
const blur  = e => e.target.style.borderColor = '#1A2535'

async function submitDonation() {
  if (!form.value.donorName) return alert('Your name is required.')
  
  // Robust ID generation: find highest numeric ID or fallback to count + 1
  const maxNum = props.donations.reduce((max, d) => {
    if (!d.id || !d.id.includes('-')) return max
    const num = parseInt(d.id.split('-')[1])
    return !isNaN(num) && num > max ? num : max
  }, 0)
  
  const newId = `DON-${String(maxNum + 1).padStart(3,'0')}`
  
  const donationPayload = {
    id: newId, donor: form.value.donorName, type: form.value.type,
    contact: form.value.contact || '—', reportId: form.value.reportId,
    message: form.value.message,
    items: form.value.items.filter(it => it.name).map(it => ({ ...it, qty: parseInt(it.qty)||0 })),
    totalValue: '—', date: new Date().toISOString().split('T')[0], status: 'pending', notes: '',
    createdAt: new Date().toISOString()
  }

  await setDoc(doc(db, 'donations', newId), donationPayload)

  submittedId.value = newId
  submitted.value = true
  form.value = blankForm()
}
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.fade-up{animation:fadeUp .4s ease forwards}
.float{animation:float 3s ease-in-out infinite;display:inline-block}
.success-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px;text-align:center}
.success-sub{font-size:14px;color:#4A6080;max-width:440px;line-height:1.8}
.ref-box{background:#0D1219;border:1px solid #00E5A044;border-radius:10px;padding:1.2rem 2rem;text-align:center}
.ref-label{font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;margin-bottom:4px}
.ref-id{font-size:22px;font-weight:900;color:#00E5A0;font-family:'DM Mono',monospace}
.portal-label{font-size:10px;color:#00E5A0;font-family:'DM Mono',monospace;letter-spacing:.12em;margin-bottom:4px}
.page-title{font-size:22px;font-weight:900}
.page-sub{color:#4A6080;font-size:13px;margin-top:4px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.25rem}
.card-title{font-size:14px;font-weight:700;margin-bottom:14px;color:#00E5A0}
.field{margin-bottom:12px}
.field-label{display:block;font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.field-input{width:100%;background:#060A0F;border:1px solid #1A2535;border-radius:6px;padding:10px 12px;color:#E2EAF4;font-size:13px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.field-select{appearance:none;cursor:pointer}
.item-row{display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center}
.remove-btn{background:#FF3B5C18;border:1px solid #FF3B5C44;color:#FF3B5C;border-radius:4px;padding:6px 10px;font-size:12px;cursor:pointer}
.add-item-btn{background:none;border:1px dashed #1A2535;color:#4A6080;border-radius:4px;padding:6px 16px;font-size:12px;cursor:pointer;width:100%;margin-top:4px}
.add-item-btn:hover{border-color:#00E5A044;color:#00E5A0}
.quick-btn{background:#060A0F;border:1px solid #1A2535;color:#4A6080;padding:5px 12px;font-size:11px;border-radius:4px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.quick-btn:hover{border-color:#00E5A044;color:#00E5A0}
.btn-primary{background:#00E5A0;color:#060A0F;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;border:1px solid #1A2535;color:#E2EAF4;border-radius:6px;padding:10px 20px;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s}
.btn-ghost:hover{border-color:#00E5A044;color:#00E5A0}
</style>
