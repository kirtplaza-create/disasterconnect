<template>
  <div class="fade-up page-wrap">
    <div style="margin-bottom:16px;flex-shrink:0;">
      <div class="module-label">AI MODULE 04</div>
      <h1 class="page-title">AI Command Center</h1>
      <p class="page-sub">Ask Claude AI anything about the current disaster situation using live system data</p>
    </div>

    <div class="card chat-card">

      <!-- Quick suggestions (shown only when chat is empty) -->
      <div v-if="messages.length === 0" class="suggestions">
        <div class="section-label">QUICK QUESTIONS</div>
        <div class="suggestions-wrap">
          <button v-for="s in SUGGESTIONS" :key="s" class="suggestion-btn" @click="ask(s)">{{ s }}</button>
        </div>
      </div>

      <!-- Chat log -->
      <div ref="logRef" class="chat-log">
        <div v-for="(m, i) in messages" :key="i" class="fade-up message-row" :style="{ flexDirection: m.role==='user' ? 'row-reverse':'row' }">
          <div class="avatar" :style="{ background: m.role==='user' ? 'var(--color-high)':'var(--color-accent)' }">
            <User v-if="m.role === 'user'" :size="14" color="white" />
            <Bot v-else :size="14" color="white" />
          </div>
          <div class="bubble" :style="m.role==='user' ? 'background:color-mix(in srgb, var(--color-high), transparent 91%); border-color:color-mix(in srgb, var(--color-high), transparent 73%);' : 'background:var(--bg-body); border-color:var(--border-color);'">
            <div v-if="m.role === 'ai'" class="ai-label">▸ {{ m.provider }}</div>
            {{ m.text }}
          </div>
        </div>

        <!-- Thinking indicator -->
        <div v-if="loading" class="message-row">
          <div class="avatar" style="background:var(--color-accent);">
            <Bot :size="14" color="white" />
          </div>
          <div class="bubble thinking">
            <span class="thinking-text">{{ thinkingStep }}</span>
            <div v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: (i-1)*0.2+'s' }" />
          </div>
        </div>
      </div>

      <!-- Input bar -->
      <div class="input-row">
        <input
          v-model="input"
          class="chat-input"
          placeholder="Ask the AI anything about the current disaster situation..."
          @keydown.enter="ask()"
          @focus="e => e.target.style.borderColor='var(--color-accent)'"
          @blur="e => e.target.style.borderColor='var(--border-color)'"
        />
        <button class="btn-primary" :disabled="loading || !input.trim()" @click="ask()">
          Send <Send :size="12" style="margin-left: 4px;" />
        </button>
        <button v-if="messages.length > 0" class="btn-ghost" @click="messages = []">Clear</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { User, Bot, Send } from 'lucide-vue-next'
import { askAI } from '../services/aiService.js'
import { AI_CONFIG } from '../config.js'

const props = defineProps({
  reports:   { type: Array, required: true },
  inventory: { type: Array, required: true },
  donations: { type: Array, required: true },
  deliveries:{ type: Array, required: true },
})

const messages = ref([])
const input    = ref('')
const loading  = ref(false)
const thinkingStep = ref('') // 'Analyzing...' or 'Generating...'
const logRef   = ref(null)

const SUGGESTIONS = [
  'Which barangay needs the most help right now?',
  'What resources are running low?',
  'Summarize all active disaster reports.',
  'Which donations are still pending or in-transit?',
  'Which deliveries are delayed or not yet dispatched?',
  'Which areas have the most vulnerable populations?',
  'How many total people are affected across all reports?',
  'Recommend our top 3 immediate actions.',
]

async function scrollToBottom() {
  await nextTick()
  if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
}

async function ask(q) {
  const question = q || input.value.trim()
  if (!question || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text: question })
  loading.value = true
  await scrollToBottom()

  thinkingStep.value = 'Ingesting full system data...'
  const context = `
CURRENT SYSTEM DATA:
Reports: ${JSON.stringify(props.reports.map(r => ({ id:r.id, brgy:r.brgy, dtype:r.dtype, severity:r.severity, urgent:r.urgency, individuals:r.individuals, families:r.families, foodRequested:r.foodNeeded, waterRequested:r.waterNeeded })))}
Inventory: ${JSON.stringify(props.inventory.map(i => ({ item:i.item, available:i.available, low:i.low })))}
Donations: ${JSON.stringify(props.donations.map(d => ({ donor:d.donor, type:d.type, status:d.status, value:d.totalValue })))}
Deliveries: ${JSON.stringify(props.deliveries.map(d => ({ brgy:d.brgy, status:d.status })))}
Date: ${new Date().toLocaleDateString()}`

  try {
    thinkingStep.value = 'Llama 3.1 is analyzing...'
    const system = `You are DisasterConnect's AI Command Assistant. You have access to real-time disaster management data. Provide clear, direct, and data-driven answers using the numbers provided. Be professional and concise.`
    const prompt = `${context}\n\nLGU User Question: ${question}`

    const answer = await askAI(system, prompt)
    messages.value.push({ 
      role: 'ai', 
      text: answer,
      provider: AI_CONFIG.provider === 'local' ? 'LOCAL OLLAMA' : 'CLOUD AI'
    })
  } catch (e) {
    messages.value.push({ role: 'ai', text: 'AI Error: ' + e.message, provider: 'SYSTEM' })
  }

  loading.value = false
  await scrollToBottom()
}
</script>

<style scoped>
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.fade-up{animation:fadeUp .4s ease forwards}

.page-wrap{height:calc(100vh - 120px);display:flex;flex-direction:column;}
.module-label{font-size:10px;color:var(--color-accent);font-family:'DM Mono',monospace;letter-spacing:.12em;margin-bottom:4px}
.page-title{font-size:22px;font-weight:800}
.page-sub{color:var(--text-secondary);font-size:13px;margin-top:4px}
.section-label{font-size:11px;color:var(--text-secondary);font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px}

.card{background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:1.25rem}
.chat-card{flex:1;display:flex;flex-direction:column;overflow:hidden;}

.suggestions{margin-bottom:16px;flex-shrink:0}
.suggestions-wrap{display:flex;flex-wrap:wrap;gap:8px}
.suggestion-btn{background:var(--bg-body);border:1px solid var(--border-color);color:var(--text-secondary);padding:6px 14px;font-size:12px;border-radius:4px;cursor:pointer;transition:all .15s;font-family:'Outfit',sans-serif}
.suggestion-btn:hover{border-color:var(--color-accent);color:var(--color-accent)}

.chat-log{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px;margin-bottom:12px}
.message-row{display:flex;gap:12px;align-items:flex-start}
.avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.bubble{max-width:75%;border:1px solid;border-radius:6px;padding:10px 14px;font-size:13px;line-height:1.7;color:var(--text-primary);white-space:pre-wrap}
.ai-label{font-size:10px;color:var(--color-accent);font-family:'DM Mono',monospace;letter-spacing:.08em;margin-bottom:4px}
.thinking{display:flex;gap:6px;align-items:center;}
.dot{width:6px;height:6px;border-radius:50%;background:var(--color-accent);animation:pulse 1.4s infinite}

.input-row{display:flex;gap:8px;flex-shrink:0}
.chat-input{flex:1;background:var(--bg-body);border:1px solid var(--border-color);border-radius:4px;padding:10px 14px;color:var(--text-primary);font-size:13px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.btn-primary{background:var(--color-accent);color:var(--bg-body);border:none;border-radius:4px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'Outfit',sans-serif}
.btn-primary:hover{opacity:.85}
.btn-primary:disabled{opacity:0.5;cursor:not-allowed}
.btn-ghost{background:transparent;border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;padding:10px 16px;font-size:13px;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif}
.btn-ghost:hover{border-color:var(--color-danger);color:var(--color-danger)}
</style>
