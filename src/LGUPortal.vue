<template>
  <!-- LGU PORTAL SHELL
       This component owns the sidebar + the main content area.
       It decides which page component to render based on currentPage. -->
  <div class="lgu-shell">

    <!-- Sidebar (always visible) -->
    <LGUSidebar
      :currentPage="currentPage"
      :alerts="alerts"
      :user="user"
      @navigate="currentPage = $event"
      @logout="$emit('logout')"
    />

    <!-- Main content area (shifts right to make room for sidebar) -->
    <main class="lgu-main">

      <!-- Each page is a separate component.
           v-if renders only the active one. -->
      <LGUDashboard
        v-if="currentPage === 'dashboard'"
        :reports="reports"
        :inventory="inventory"
        :donations="donations"
        :deliveries="deliveries"
        @navigate="currentPage = $event"
      />

      <!-- Placeholder pages — we'll replace these one by one -->
      <LGUReports
        v-else-if="currentPage === 'reports'"
        :reports="reports"
        @update:reports="reports = $event"
        @navigate="currentPage = $event"
      />

      <LGUAnalysis
        v-else-if="currentPage === 'analysis'"
        :reports="reports"
      />
      <LGUNeeds
        v-else-if="currentPage === 'needs'"
        :reports="reports"
        :inventory="inventory"
      />
      <LGUMatching
        v-else-if="currentPage === 'matching'"
        :reports="reports"
        :inventory="inventory"
      />
      <LGUInventory
        v-else-if="currentPage === 'inventory'"
        :inventory="inventory"
      />
      <LGUDonations
        v-else-if="currentPage === 'donations'"
        :donations="donations"
        :reports="reports"
      />
      <LGUDeliveries
        v-else-if="currentPage === 'deliveries'"
        :deliveries="deliveries"
        :reports="reports"
      />
      <LGUBI
        v-else-if="currentPage === 'bi'"
        :reports="reports"
        :deliveries="deliveries"
        :donations="donations"
        :inventory="inventory"
      />
      <LGUAssistant
        v-else-if="currentPage === 'assistant'"
        :reports="reports"
        :inventory="inventory"
        :donations="donations"
        :deliveries="deliveries"
      />

    </main>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import LGUSidebar   from './LGUSidebar.vue'
import LGUDashboard from './pages/LGUDashboard.vue'
import LGUReports   from './pages/LGUReports.vue'
import LGUAnalysis  from './pages/LGUAnalysis.vue'
import LGUNeeds     from './pages/LGUNeeds.vue'
import LGUMatching  from './pages/LGUMatching.vue'
import LGUInventory from './pages/LGUInventory.vue'
import LGUDonations from './pages/LGUDonations.vue'
import LGUDeliveries from './pages/LGUDeliveries.vue'
import LGUBI        from './pages/LGUBI.vue'
import LGUAssistant from './pages/LGUAssistant.vue'

// ─── PLACEHOLDER COMPONENT ────────────────────────────────────────────────────
// Inline component for pages we haven't built yet
// We'll replace these with real components one by one
const PagePlaceholder = {
  props: ['icon', 'title', 'color'],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:12px;text-align:center">
      <div style="font-size:52px;margin-bottom:8px">{{ icon }}</div>
      <h2 style="font-size:24px;font-weight:900;" :style="{ color }">{{ title }}</h2>
      <p style="font-size:13px;color: var(--text-secondary)">This page is coming next!</p>
      <div style="margin-top:8px;padding:5px 16px;background: var(--bg-surface);border:1px solid var(--border-color);border-radius:20px;font-size:11px;color: var(--text-secondary);font-family:'DM Mono',monospace">
        COMING SOON
      </div>
    </div>
  `,
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
const props = defineProps({
  user:       { type: Object, required: true },
  reports:    { type: Array, default: () => [] },
  inventory:  { type: Array, default: () => [] },
  donations:  { type: Array, default: () => [] },
  deliveries: { type: Array, default: () => [] },
})
defineEmits(['logout'])

// ─── PAGE STATE ───────────────────────────────────────────────────────────────
// Tracks which page the sidebar is currently showing
const currentPage = ref('dashboard')

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
// Count of critical/high reports for the alert badge in the sidebar
const alerts = computed(() =>
  props.reports.filter(r => r.severity === 'Critical' || r.severity === 'High').length
)
</script>


<style scoped>
.lgu-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-body);
}
.lgu-main {
  margin-left: 220px;   /* same width as the sidebar */
  flex: 1;
  padding: 2rem 2.5rem;
  min-height: 100vh;
}
</style>