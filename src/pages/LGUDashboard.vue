<template>
  <div class="fade-up">

    <!-- ── CRITICAL ALERT BAR ── -->
    <!-- Only shows if there are Critical severity reports -->
    <div v-if="criticalCount > 0" class="alert-bar">
      <AlertTriangle class="alert-icon" :size="16" />
      <span class="alert-text">
        {{ criticalCount }} CRITICAL disaster{{ criticalCount > 1 ? 's' : '' }} requiring immediate response
      </span>
      <button class="alert-btn" @click="$emit('navigate', 'reports')">View Now</button>
    </div>

    <!-- ── PAGE TITLE ── -->
    <div class="page-top">
      <h1 class="page-title">Disaster Operations Dashboard</h1>
      <p class="page-sub">Real-time overview · Click any AI result badge to view full details</p>
    </div>

    <!-- ── 4 STAT BOXES ── -->
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value" style="color: var(--color-accent);">{{ reports.length }}</div>
        <div class="stat-label">Active Disasters</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color: var(--color-danger);">{{ criticalCount }}</div>
        <div class="stat-label">Critical Alerts</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color: var(--color-high);">{{ totalAffected.toLocaleString() }}</div>
        <div class="stat-label">Total Affected</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color: var(--color-warn);">{{ totalEvacuees.toLocaleString() }}</div>
        <div class="stat-label">Total Evacuees</div>
      </div>
    </div>

    <!-- ── BARANGAY AI RESULTS TABLE ── -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <div>
          <div class="card-title">Barangay AI Results Overview</div>
          <div class="card-sub">Click any result badge to review the full AI output for that barangay</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th v-for="h in tableHeaders" :key="h" class="th">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id" class="table-row">

            <!-- Barangay name + ID -->
            <td class="td">
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="sev-dot" :style="{ background: sevColor(r.severity) }" />
                <div>
                  <div class="report-name">{{ r.brgy }}</div>
                  <div class="report-meta">{{ r.id }} · {{ r.muni }}</div>
                </div>
              </div>
            </td>

            <!-- Disaster type + count -->
            <td class="td">
              <span class="badge" :style="badgeStyle('var(--color-accent)')">{{ r.dtype }}</span>
              <div class="report-meta" style="margin-top:4px;">{{ r.individuals }} ppl</div>
            </td>

            <!-- Severity -->
            <td class="td">
              <span class="badge" :style="badgeStyle(sevColor(r.severity))">{{ r.severity }}</span>
            </td>

            <!-- AI Analysis -->
            <td class="td">
              <button v-if="r.aiAnalysis" class="result-btn"
                :style="{ 
                  background: `color-mix(in srgb, ${sevColor(r.aiAnalysis.severityLevel)}, transparent 92%)`, 
                  border: `1px solid color-mix(in srgb, ${sevColor(r.aiAnalysis.severityLevel)}, transparent 66%)` 
                }"
                @click="openModal(r, 'analysis')">
                <div class="result-btn-title" :style="{ color: sevColor(r.aiAnalysis.severityLevel) }">{{ r.aiAnalysis.severityLevel }}</div>
                <div class="result-btn-sub">Score {{ r.aiAnalysis.severityScore }}/100</div>
                <div class="result-btn-link">View details →</div>
              </button>
              <button v-else class="empty-btn" @click="$emit('navigate', 'analysis')">+ Run Analysis</button>
            </td>

            <!-- Needs Assessment -->
            <td class="td">
              <button v-if="r.needsAssessment" class="result-btn"
                style="background:color-mix(in srgb, var(--color-success), transparent 94%); border:1px solid color-mix(in srgb, var(--color-success), transparent 73%);"
                @click="openModal(r, 'needs')">
                <div class="result-btn-title" style="color:var(--color-success);">{{ r.needsAssessment.foodPacks }} packs</div>
                <div class="result-btn-sub">{{ r.needsAssessment.waterLiters?.toLocaleString() }}L · {{ r.needsAssessment.medicalKits }} kits</div>
                <div class="result-btn-link">View details →</div>
              </button>
              <button v-else class="empty-btn" @click="$emit('navigate', 'needs')">+ Run Assessment</button>
            </td>

            <!-- Resource Matching -->
            <td class="td">
              <button v-if="r.allocation" class="result-btn"
                style="background:color-mix(in srgb, var(--color-high), transparent 94%); border:1px solid color-mix(in srgb, var(--color-high), transparent 73%);"
                @click="openModal(r, 'matching')">
                <div class="result-btn-title" style="color:var(--color-high);">{{ r.allocation.allocations?.[0]?.foodPacks }} packs</div>
                <div class="result-btn-sub">{{ r.allocation.allocations?.[0]?.waterLiters?.toLocaleString() }}L</div>
                <div class="result-btn-link">View details →</div>
              </button>
              <button v-else class="empty-btn" @click="$emit('navigate', 'matching')">+ Run Matching</button>
            </td>

            <!-- Mini pipeline dots -->
            <td class="td">
              <div style="display:flex;gap:3px;">
                <div v-for="(step, i) in pipelineSteps(r)" :key="i"
                  class="pipeline-dot"
                  :title="step.label"
                  :style="{ background: step.done ? (step.ai ? 'var(--color-accent)' : 'var(--color-success)') : 'var(--border-color)' }" />
              </div>
              <div class="pipeline-count">
                {{ pipelineSteps(r).filter(s => s.done).length }}/{{ pipelineSteps(r).length }} steps
              </div>
            </td>

            <!-- Status -->
            <td class="td">
              <span class="badge" :style="badgeStyle(statusColor(r.status))">{{ (r.status || 'pending').toString().toUpperCase() }}</span>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── BOTTOM: Active Reports + Inventory ── -->
    <div class="two-col">

      <!-- Active Disaster Reports -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Active Disaster Reports</div>
          <button class="ghost-btn" @click="$emit('navigate', 'reports')">View All</button>
        </div>
        <div v-for="r in reports" :key="r.id" class="report-row">
          <div class="sev-dot" :style="{ background: sevColor(r.severity) }" />
          <div style="flex:1;">
            <div class="report-name">{{ r.brgy }}</div>
            <div class="report-meta">{{ r.dtype }} · {{ r.muni }} · {{ r.individuals }} affected</div>
          </div>
          <span class="badge" :style="badgeStyle(sevColor(r.severity))">{{ r.severity }}</span>
          <span class="badge" :style="badgeStyle(statusColor(r.status))">{{ (r.status || 'pending').toUpperCase() }}</span>
        </div>
      </div>

      <!-- Resource Inventory -->
      <div class="card">
        <div class="card-title" style="margin-bottom:16px;">Resource Inventory</div>
        <div v-for="inv in inventory" :key="inv.id" class="inv-row">
          <div class="inv-top">
            <span :style="{ fontSize:'12px', color: inv.low ? 'var(--color-danger)' : 'var(--text-primary)' }">
              {{ inv.item }} 
              <AlertTriangle v-if="inv.low" :size="12" style="display:inline; margin-left:4px;" />
            </span>
            <span :style="{ fontSize:'12px', fontFamily:'DM Mono,monospace', color: inv.low ? 'var(--color-danger)' : 'var(--color-accent)' }">{{ (inv.available || 0).toLocaleString() }} {{ inv.unit }}</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: (inv.low ? 18 : 65) + '%', background: inv.low ? 'var(--color-danger)' : 'var(--color-success)' }" />
          </div>
        </div>
        <button class="ghost-btn" style="width:100%;margin-top:12px;justify-content:center;" @click="$emit('navigate', 'inventory')">
          Manage Inventory
        </button>
      </div>
    </div>



    <!-- ── MODAL ── -->
    <Teleport to="body">
      <div v-if="modalReport" class="modal-backdrop" @click.self="modalReport = null">
        <div class="modal fade-up">

        <div class="modal-header">
          <div class="sev-dot" :style="{ background: sevColor(modalReport.severity) }" />
          <div style="flex:1;">
            <div class="modal-title">{{ modalReport.brgy }} — AI Results</div>
            <div class="modal-sub">{{ modalReport.dtype }} · {{ modalReport.muni }} · {{ modalReport.date }}</div>
          </div>
          <button class="close-btn" @click="modalReport = null"><X :size="18" /></button>
        </div>

        <div class="modal-tabs">
          <button v-for="tab in modalTabs" :key="tab.id" class="modal-tab"
            :style="{
              borderBottomColor: modalTab === tab.id ? 'var(--color-accent)' : 'transparent',
              color: !tab.has ? 'var(--text-secondary)' : modalTab === tab.id ? 'var(--color-accent)' : 'var(--text-primary)',
              opacity: tab.has ? 1 : 0.6,
              cursor: 'pointer'
            }"
            @click="modalTab = tab.id">
            {{ tab.label }}<span v-if="!tab.has" style="font-size:10px;"> (not run)</span>
          </button>
        </div>

        <div class="modal-body">

          <!-- ── AI Analysis Tab ── -->
          <template v-if="modalTab === 'analysis'">
            <div v-if="modalReport.aiAnalysis" class="fade-up">
              
              <!-- Scoring Grid (Expanded with Factors) -->
              <div class="score-grid-large" style="margin-top: 8px;">
                <div class="analysis-score-card" :style="{ borderTop: `4px solid ${sevColor(modalReport.aiAnalysis.severity?.level || modalReport.aiAnalysis.severityLevel)}` }">
                  <div class="score-header">
                    <span class="score-label">SEVERITY ANALYSIS</span>
                    <span class="score-level-badge" :style="{ background: `color-mix(in srgb, ${sevColor(modalReport.aiAnalysis.severity?.level || modalReport.aiAnalysis.severityLevel)}, transparent 85%)`, color: sevColor(modalReport.aiAnalysis.severity?.level || modalReport.aiAnalysis.severityLevel) }">
                      {{ (modalReport.aiAnalysis.severity?.level || modalReport.aiAnalysis.severityLevel)?.toUpperCase() }}
                    </span>
                  </div>
                  <div class="score-main">
                    <div class="score-num">{{ modalReport.aiAnalysis.severity?.score || modalReport.aiAnalysis.severityScore }}<span class="score-max">/100</span></div>
                    <div class="progress-bg"><div class="progress-fill" :style="{ width: (modalReport.aiAnalysis.severity?.score || modalReport.aiAnalysis.severityScore) + '%', background: sevColor(modalReport.aiAnalysis.severity?.level || modalReport.aiAnalysis.severityLevel) }" /></div>
                  </div>
                  <!-- Support both hardened and legacy schemas -->
                  <div v-if="modalReport.aiAnalysis.severity?.pushFactors" class="factor-box">
                    <div class="factor-item"><span class="f-lbl">Push Factors:</span> {{ modalReport.aiAnalysis.severity.pushFactors }}</div>
                    <div class="factor-item"><span class="f-lbl">Kept Lower By:</span> {{ modalReport.aiAnalysis.severity.keptLowerFactors }}</div>
                    <div class="factor-item t-warn"><span class="f-lbl">Increase Trigger:</span> {{ modalReport.aiAnalysis.severity.increaseKillers }}</div>
                  </div>
                </div>

                <div class="analysis-score-card" :style="{ borderTop: `4px solid ${sevColor(modalReport.aiAnalysis.urgency?.level || modalReport.aiAnalysis.urgencyLevel)}` }">
                  <div class="score-header">
                    <span class="score-label">URGENCY & VULNERABILITY</span>
                    <span class="score-level-badge" :style="{ background: `color-mix(in srgb, ${sevColor(modalReport.aiAnalysis.urgency?.level || modalReport.aiAnalysis.urgencyLevel)}, transparent 85%)`, color: sevColor(modalReport.aiAnalysis.urgency?.level || modalReport.aiAnalysis.urgencyLevel) }">
                      {{ (modalReport.aiAnalysis.urgency?.level || modalReport.aiAnalysis.urgencyLevel)?.toUpperCase() }}
                    </span>
                  </div>
                  <div class="score-main">
                    <div class="score-num">{{ modalReport.aiAnalysis.urgency?.score || modalReport.aiAnalysis.vulnerabilityScore }}<span class="score-max">/100</span></div>
                    <div class="progress-bg"><div class="progress-fill" :style="{ width: (modalReport.aiAnalysis.urgency?.score || modalReport.aiAnalysis.vulnerabilityScore) + '%', background: sevColor(modalReport.aiAnalysis.urgency?.level || modalReport.aiAnalysis.urgencyLevel) }" /></div>
                  </div>
                  <!-- Support both hardened and legacy schemas -->
                  <div v-if="modalReport.aiAnalysis.urgency?.pushFactors" class="factor-box">
                    <div class="factor-item"><span class="f-lbl">Push Factors:</span> {{ modalReport.aiAnalysis.urgency.pushFactors }}</div>
                    <div class="factor-item"><span class="f-lbl">Kept Lower By:</span> {{ modalReport.aiAnalysis.urgency.keptLowerFactors }}</div>
                    <div class="factor-item t-warn"><span class="f-lbl">Increase Trigger:</span> {{ modalReport.aiAnalysis.urgency.increaseKillers }}</div>
                  </div>
                </div>
              </div>

              <div class="section-label" style="margin-top: 16px;">CLASSIFICATION & CONTEXT</div>
              <div v-if="typeof (modalReport.aiAnalysis.classification || modalReport.aiAnalysis.disasterClassification) === 'object'" class="classification-grid">
                <div v-for="(val, key) in (modalReport.aiAnalysis.classification || modalReport.aiAnalysis.disasterClassification)" :key="key" class="class-item">
                  <span class="class-key">{{ key.replace(/_/g, ' ') }}:</span>
                  <span class="class-val">{{ val }}</span>
                </div>
              </div>
              <p v-else class="paragraph-text">{{ modalReport.aiAnalysis.classification || modalReport.aiAnalysis.disasterClassification }}</p>

              <div class="divider" />

              <!-- Key Findings (Timeline View) -->
              <div class="section-label">KEY FINDINGS & ANALYSIS</div>
              <div class="findings-container">
                  <div v-if="modalReport.aiAnalysis.keyFindings?.disproportionateImpact" class="finding-block">
                    <div class="f-key" style="color:var(--color-accent);">Disproportionate Impact</div>
                    <div class="f-val">{{ modalReport.aiAnalysis.keyFindings.disproportionateImpact }}</div>
                  </div>
                  <div class="finding-block">
                    <div class="f-key" style="color:var(--color-accent);">Expert Findings</div>
                    <div class="f-val">{{ typeof modalReport.aiAnalysis.keyFindings === 'string' ? modalReport.aiAnalysis.keyFindings : (modalReport.aiAnalysis.keyFindings?.compoundingInfrastructure || '') + ' ' + (modalReport.aiAnalysis.keyFindings?.capacityGaps || '') }}</div>
                  </div>
                  
                  <div v-if="modalReport.aiAnalysis.keyFindings?.timeline" class="timeline-box">
                    <div class="timeline-title" style="color:var(--color-warn);">Urgency Timeline (Consequences of Delay)</div>
                    <div class="timeline-grid">
                      <div v-for="h in ['24','48','72']" :key="h" class="t-col">
                        <div class="t-hour">{{ h }} HOURS</div>
                        <div class="t-desc">{{ modalReport.aiAnalysis.keyFindings.timeline['h'+h] }}</div>
                      </div>
                    </div>
                  </div>
              </div>

              <div class="divider" />

              <div class="section-label">PRIORITY RELIEF NEEDS</div>
              <div class="needs-grid-detailed">
                <!-- Hardened Schema -->
                <template v-if="Array.isArray(modalReport.aiAnalysis.priorityNeeds) && modalReport.aiAnalysis.priorityNeeds[0]?.need">
                  <div v-for="n in modalReport.aiAnalysis.priorityNeeds" :key="n.need" class="need-detail-card">
                    <div class="n-header">
                      <span class="n-title">{{ n.need }}</span>
                      <span class="n-actor">{{ n.actor }}</span>
                    </div>
                    <div class="n-body">
                      <div class="n-info"><span class="n-lbl">Rationale:</span> {{ n.why }}</div>
                      <div class="n-info t-danger"><span class="n-lbl">Risk:</span> {{ n.consequence }}</div>
                    </div>
                  </div>
                </template>
                <!-- Legacy Schema -->
                <template v-else>
                   <div v-for="n in modalReport.aiAnalysis.priorityNeeds" :key="n" class="pill-legacy">{{ n }}</div>
                </template>
              </div>

              <div class="divider" />

              <div v-if="modalReport.aiAnalysis.actionPlan" class="section-label">IMMEDIATE ACTION PLAN (NDRRMC ALIGNED)</div>
              <div v-if="modalReport.aiAnalysis.actionPlan" class="action-phases">
                <div class="phase-card">
                  <div class="phase-hdr">Phase 1: Hour 0-6 (First Response)</div>
                  <div class="phase-body">
                    <div class="p-item"><strong>Critical Actions:</strong> {{ modalReport.aiAnalysis.actionPlan.h0_6?.actions }}</div>
                    <div class="p-item"><strong>Responsibility:</strong> {{ modalReport.aiAnalysis.actionPlan.h0_6?.responsible }}</div>
                  </div>
                </div>
                <div class="phase-card">
                  <div class="phase-hdr">Phase 2: Hour 6-24 (Mobilization)</div>
                  <div class="phase-body">
                    <div class="p-item"><strong>Coordination:</strong> {{ modalReport.aiAnalysis.actionPlan.h6_24?.coordination }}</div>
                    <div class="p-item"><strong>Comms:</strong> {{ modalReport.aiAnalysis.actionPlan.h6_24?.communication }}</div>
                  </div>
                </div>
              </div>

              <div class="divider" />

              <div v-if="modalReport.aiAnalysis.riskFactors" class="section-label">RISK FACTOR MATRIX</div>
              <div v-for="rf in modalReport.aiAnalysis.riskFactors" :key="rf.risk || rf" class="risk-matrix-row">
                <div class="rm-main">
                  <div class="rm-title">
                    <AlertTriangle class="rm-icon" :size="18" />
                    {{ rf.risk || rf }}
                  </div>
                  <div v-if="rf.trigger" class="rm-trigger">{{ rf.trigger }}</div>
                </div>
                <div v-if="rf.mitigation" class="rm-mitigation">
                  <div class="rm-m-lbl">Mitigation Action:</div>
                  <div style="font-size:12px;color:var(--text-secondary);">{{ rf.mitigation }}</div>
                </div>
              </div>

            </div>
            <div v-else class="empty-state">
              <Brain :size="48" style="margin-bottom: 12px; opacity: 0.5;" />
              No AI Analysis run yet for this report.
              <button class="ghost-btn" style="margin-top:12px;" @click="$emit('navigate','analysis');modalReport=null">Run AI Analysis →</button>
            </div>
          </template>

          <!-- ── Needs Assessment Tab ── -->
          <template v-if="modalTab === 'needs'">
            <div v-if="modalReport.needsAssessment" class="fade-up">
              
              <div class="score-grid-large" style="margin-top: 8px;">
                <div class="score-box-premium" style="background:color-mix(in srgb, var(--color-accent), transparent 93%); border:1px solid color-mix(in srgb, var(--color-accent), transparent 73%);">
                  <div class="sb-lbl">ESTIMATED DURATION</div>
                  <div class="sb-val" style="color:var(--color-accent); font-size: 24px;">{{ modalReport.needsAssessment.durationDays }} Days</div>
                  <div class="sb-sub">Coverage Window</div>
                </div>
                <div class="score-box-premium" style="background:color-mix(in srgb, var(--color-warn), transparent 93%); border:1px solid color-mix(in srgb, var(--color-warn), transparent 73%);">
                  <div class="sb-lbl">BUDGET ESTIMATE</div>
                  <div class="sb-val" style="color:var(--color-warn); font-size: 20px;">{{ modalReport.needsAssessment.totalBudgetEstimate }}</div>
                  <div class="sb-sub">Total Funding Required</div>
                </div>
              </div>

              <!-- Vulnerability Assessment -->
              <div class="section-label">VULNERABILITY ASSESSMENT</div>
              <div class="vuln-box-premium">
                <AlertTriangle :size="18" style="margin-right: 8px; flex-shrink: 0;" />
                <span>{{ modalReport.needsAssessment.vulnerabilityNote }}</span>
              </div>

              <div class="divider" />

              <div class="section-label">EXECUTIVE SUMMARY</div>
              <p class="paragraph-text">{{ modalReport.needsAssessment.adjustmentReason }}</p>

              <div class="divider" />

              <template v-if="modalReport.needsAssessment.budgetBreakdown">
                <div class="section-label">FINANCIAL LOGIC & CONTEXT</div>
                <div class="reason-pill" style="border-left-color: var(--color-warn); margin-bottom: 16px;">
                  <div class="rp-key" style="color: var(--color-warn);">Budget Derivation</div>
                  <div class="rp-val">{{ modalReport.needsAssessment.budgetBreakdown }}</div>
                </div>
                <div class="divider" />
              </template>

              <div class="section-label" style="margin-bottom: 12px; margin-top: 16px;">BASELINE SYSTEM CALCULATION</div>
              <div class="analysis-score-card" style="margin-bottom: 16px; padding: 16px;">
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 16px;">Formula: 1 food pack + 3L water per person/day</div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                  <span>Individuals</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ modalReport.individuals }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                  <span>Base Food Packs</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ getBaseline(modalReport, 'food') }} packs</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                  <span>Base Water</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ getBaseline(modalReport, 'water').toLocaleString() }} liters</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                  <span>Base Med Kits</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ getBaseline(modalReport, 'med') }} kits</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                  <span>Elderly</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ modalReport.elderly }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: var(--text-secondary);">
                  <span>Children</span>
                  <span style="color: var(--text-primary); font-family: 'DM Mono', monospace; font-weight: 500;">{{ modalReport.children }}</span>
                </div>
              </div>

              <!-- Baseline vs AI Adjusted Table -->
              <div class="section-label">BASELINE VS AI-ADJUSTED REQUIREMENTS</div>
              <table class="matching-table-premium" style="margin-bottom: 16px;">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Baseline</th>
                    <th>AI Adjusted</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in getNeedsComparison(modalReport)" :key="row.label">
                    <td style="font-weight: 500;">{{ row.label }}</td>
                    <td style="font-family: 'DM Mono', monospace; color: var(--text-secondary);">
                      {{ typeof row.base === 'number' ? row.base.toLocaleString() : row.base }}
                    </td>
                    <td style="font-family: 'DM Mono', monospace; font-weight: 700; color: var(--color-success); font-size: 13px;">
                      {{ (row.adj || 0).toLocaleString() }}
                    </td>
                    <td>
                      <span v-if="typeof row.base === 'number' && row.adj > row.base" style="font-size: 11px; font-family: 'DM Mono', monospace; font-weight: 700; color: var(--color-danger);">
                        +{{ (row.adj - row.base).toLocaleString() }}
                      </span>
                      <span v-else-if="typeof row.base === 'number' && row.adj < row.base" style="font-size: 11px; font-family: 'DM Mono', monospace; font-weight: 700; color: var(--color-success);">
                        {{ (row.adj - row.base).toLocaleString() }}
                      </span>
                      <span v-else style="color: var(--text-secondary);">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="divider" />

              <div class="section-label">DETAILED REASONING BY CATEGORY</div>
              <div class="reasoning-grid-premium">
                <div v-if="modalReport.needsAssessment.reasoning?.food" class="reason-pill">
                  <div class="rp-key">Food Adjustment</div>
                  <div class="rp-val">{{ modalReport.needsAssessment.reasoning.food }}</div>
                </div>
                <div v-if="modalReport.needsAssessment.reasoning?.water" class="reason-pill">
                  <div class="rp-key">Water Adjustment</div>
                  <div class="rp-val">{{ modalReport.needsAssessment.reasoning.water }}</div>
                </div>
                <div v-if="modalReport.needsAssessment.reasoning?.medical" class="reason-pill">
                  <div class="rp-key">Medical & Health Logic</div>
                  <div class="rp-val">{{ modalReport.needsAssessment.reasoning.medical }}</div>
                </div>
                <div v-if="modalReport.needsAssessment.hygieneKits" class="reason-pill">
                  <div class="rp-key">Sanitation & Hygiene</div>
                  <div class="rp-val">Requirement of {{ modalReport.needsAssessment.hygieneKits }} kits based on 1 kit per family and vulnerability multipliers.</div>
                </div>
                <div v-if="modalReport.needsAssessment.reasoning?.other" class="reason-pill">
                  <div class="rp-key">Shelter & Logistics (Blankets/Tents)</div>
                  <div class="rp-val">{{ modalReport.needsAssessment.reasoning.other }}</div>
                </div>
              </div>

              <div class="divider" />

              <div class="section-label">SCENARIO-SPECIFIC PRIORITY ITEMS</div>
              <div class="tags-row" style="margin-top:8px;">
                <span v-for="p in modalReport.needsAssessment.priorityItems" :key="p" class="tag-premium">{{ p }}</span>
              </div>

            </div>
            <div v-else class="empty-state">
              <BarChart3 :size="48" style="margin-bottom: 12px; opacity: 0.5;" />
              No Needs Assessment run yet.
              <button class="ghost-btn" style="margin-top:12px;" @click="$emit('navigate','needs');modalReport=null">Run Needs Assessment →</button>
            </div>
          </template>

          <!-- ── AI Resource Matching Tab ── -->
          <template v-if="modalTab === 'matching'">
            <div v-if="modalReport.allocation" class="fade-up">
              
              <div class="score-grid-large" style="margin-top: 8px;">
                <div class="score-box-premium" style="background:color-mix(in srgb, var(--color-accent), transparent 93%); border:1px solid color-mix(in srgb, var(--color-accent), transparent 73%);">
                  <div class="sb-lbl">MATCH EFFICIENCY</div>
                  <div class="sb-val" style="color:var(--color-accent); font-size: 24px;">{{ modalReport.allocation.matchEfficiencyScore }}%</div>
                  <div class="sb-sub">Resource Optimization</div>
                </div>
                <div class="score-box-premium" style="background:color-mix(in srgb, var(--color-high), transparent 93%); border:1px solid color-mix(in srgb, var(--color-high), transparent 73%);">
                  <div class="sb-lbl">SUPPLY READINESS</div>
                  <div class="sb-val" style="color:var(--color-high); font-size: 24px;">{{ modalReport.allocation.resourceReadinessScore }}%</div>
                  <div class="sb-sub">Inventory Coverage</div>
                </div>
              </div>

              <div class="section-label">MATCH STATUS</div>
              <div style="font-size: 16px; margin-bottom: 12px; font-weight: 800;" :style="{ color: getStatusColor(modalReport.allocation.matchStatus) }">
                {{ modalReport.allocation.matchStatus?.toUpperCase() }}
              </div>

              <div class="divider" />

              <div class="section-label">ALLOCATION STRATEGY & LOGISTICS FLOW</div>
              <p class="paragraph-text">{{ modalReport.allocation.allocationStrategy }}</p>

              <div v-if="modalReport.allocation.warningNote" class="vuln-box-premium" style="margin-bottom:16px;">
                <AlertTriangle :size="18" style="margin-right: 8px;" />
                <span>{{ modalReport.allocation.warningNote }}</span>
              </div>

              <div class="divider" />

              <div class="section-label">DETAILED ASSIGNMENTS</div>
              <div style="overflow-x: auto; margin-bottom: 16px;">
                <table class="matching-table-premium">
                  <thead>
                    <tr>
                      <th>Target Barangay</th>
                      <th>Food Packs</th>
                      <th>Water (L)</th>
                      <th>Priority</th>
                      <th>Source Center</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(a, i) in modalReport.allocation.allocations" :key="i">
                      <td style="font-weight:700; color:var(--text-primary);">{{ a.barangay }}</td>
                      <td class="mono-cyan">{{ a.foodPacks }} pk</td>
                      <td class="mono-cyan">{{ a.waterLiters }} L</td>
                      <td>
                        <span class="score-level-badge" :style="{ background: `color-mix(in srgb, ${sevColor(a.priority)}, transparent 85%)`, color: sevColor(a.priority) }">
                          {{ a.priority }}
                        </span>
                      </td>
                      <td style="color: var(--text-secondary); font-size: 11px;">{{ a.source || a.warehouse }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="divider" />

              <div class="section-label">CONFIRMED PARTNERS / SOURCES</div>
              <div class="tags-row" style="margin-top:8px;">
                <span v-for="p in modalReport.allocation.partnersInvolved" :key="p" class="tag-premium">{{ p }}</span>
              </div>

              <div class="divider" />

              <div class="section-label">LOGISTICAL NEXT STEPS</div>
              <div v-for="(s, i) in modalReport.allocation.nextSteps" :key="i" class="step-card-premium">
                <span class="step-num-premium">{{ i + 1 }}</span>
                <span class="step-text-premium">{{ s }}</span>
              </div>

              <div class="divider" />

              <div class="section-label">REMAINING GAPS & DEFICITS</div>
              <div v-for="(g, i) in modalReport.allocation.gapsIdentified" :key="i" class="gap-card-premium">
                <AlertTriangle :size="14" style="color:var(--color-danger); margin-right:10px;" />
                <span style="font-size:12.5px; color:var(--text-secondary);">{{ g }}</span>
              </div>

            </div>
            <div v-else class="empty-state">
              <Target :size="48" style="margin-bottom: 12px; opacity: 0.5;" />
              No Resource Matching run yet.
              <button class="ghost-btn" style="margin-top:12px;" @click="$emit('navigate','matching');modalReport=null">Run Resource Matching →</button>
            </div>
          </template>

          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { askAI, parseAIJSON } from '../services/aiService'
import { 
  AlertTriangle, 
  X, 
  Brain, 
  BarChart3, 
  Target, 
  ArrowRight,
  Plus,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Boxes,
  Package,
  Bot
} from 'lucide-vue-next'

const props = defineProps({
  reports:    { type: Array, required: true },
  inventory:  { type: Array, required: true },
  donations:  { type: Array, required: true },
  deliveries: { type: Array, required: true },
})
defineEmits(['navigate'])

// ─── STATE ────────────────────────────────────────────────────────────────────
const processing = ref({}) // track reportId -> boolean

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const sevColor    = (s) => ({ Critical: 'var(--color-danger)', High: 'var(--color-high)', Moderate: 'var(--color-warn)', Low: 'var(--color-success)' })[s] || 'var(--text-secondary)'
const statusColor = (s) => ({ pending: 'var(--color-warn)', approved: 'var(--color-accent)', distributed: 'var(--color-success)', rejected: 'var(--color-danger)' })[s || 'pending'] || 'var(--text-secondary)'
const getStatusColor = (s) => {
  const st = (s || '').toLowerCase()
  if (st.includes('complete')) return 'var(--color-success)'
  if (st.includes('partial')) return 'var(--color-warn)'
  if (st.includes('shortage') || st.includes('critical')) return 'var(--color-danger)'
  return 'var(--text-primary)'
}
const badgeStyle  = (color) => ({ 
  background: `color-mix(in srgb, ${color}, transparent 90%)`, 
  border: `1px solid color-mix(in srgb, ${color}, transparent 70%)`, 
  color 
})

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const criticalCount = computed(() => props.reports.filter(r => r.severity === 'Critical').length)
const totalAffected = computed(() => props.reports.reduce((s, r) => s + r.individuals, 0))
const totalEvacuees = computed(() => props.reports.reduce((s, r) => s + r.evacuees, 0))

// ─── TABLE HEADERS ────────────────────────────────────────────────────────────
const tableHeaders = ['Barangay', 'Disaster', 'Severity', 'AI Analysis', 'Needs Assessment', 'Resource Matching', 'Pipeline', '']

// ─── PIPELINE STEPS per report ────────────────────────────────────────────────
const pipelineSteps = (r) => [
  { label: 'Report',       done: true },
  { label: 'AI Analysis',  done: !!r.aiAnalysis,      ai: true },
  { label: 'Needs',        done: !!r.needsAssessment, ai: true },
  { label: 'Matching',     done: !!r.allocation,      ai: true },
  { label: 'LGU Approved', done: r.status === 'approved' || r.status === 'distributed' },
  { label: 'Distributed',  done: r.status === 'distributed' },
]

// ─── NEEDS ASSESSMENT HELPERS ───────────────────────────────────────────────────
const getNeedsComparison = (r) => {
  if (!r || !r.needsAssessment) return []
  const baseFood = (r.individuals || 0) * 3
  const baseWater = (r.individuals || 0) * 9
  const baseMed = Math.ceil((r.injured || 0) * 1.5) || Math.ceil(r.individuals * 0.05)
  const baseHygiene = Math.ceil((r.individuals || 0) / 5)
  const n = r.needsAssessment
  return [
    { label: 'Food Packs',   base: baseFood,  adj: n.foodPacks },
    { label: 'Water (L)',    base: baseWater, adj: n.waterLiters },
    { label: 'Medical Kits', base: baseMed,   adj: n.medicalKits },
    { label: 'Hygiene Kits', base: baseHygiene, adj: n.hygieneKits },
    { label: 'Blankets',     base: 0,         adj: n.blankets },
    { label: 'Tents',        base: 0,         adj: n.tents },
  ]
}
const getBaseline = (r, type) => {
  if (!r) return 0
  if (type === 'food') return (r.individuals || 0) * 3
  if (type === 'water') return (r.individuals || 0) * 9
  if (type === 'med') return Math.ceil((r.injured || 0) * 1.5) || Math.ceil(r.individuals * 0.05)
  return 0
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
const modalReport = ref(null)
const modalTab    = ref('analysis')

watch(modalReport, (newVal) => {
  if (newVal) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
})

const openModal = (report, tab) => {
  modalReport.value = report
  modalTab.value    = tab
}

const modalTabs = computed(() => [
  { id: 'analysis', label: 'AI Analysis',      has: !!modalReport.value?.aiAnalysis },
  { id: 'needs',    label: 'Needs Assessment',  has: !!modalReport.value?.needsAssessment },
  { id: 'matching', label: 'Resource Matching', has: !!modalReport.value?.allocation },
])

// ─── INLINE ACTIONS ───────────────────────────────────────────────────────────
async function runAnalysisInline(r) {
  if (processing.value[r.id]) return
  processing.value[r.id] = true
  
  try {
    const system = `You are DisasterConnect, an expert NDRRMC analyst. Respond ONLY with MINIFIED JSON.
    Use SINGLE QUOTES for internal text. No double quotes inside strings.`
    
    const prompt = `Perform a Situation Analysis for Barangay ${r.brgy}. 
    Data: ${r.desc}. Affected: ${r.individuals} people, ${r.families} families.
    
    Required JSON Schema:
    {
      "severityScore": number,
      "severityLevel": "Critical"|"High"|"Moderate"|"Low",
      "urgencyLevel": string,
      "vulnerabilityScore": number,
      "disasterClassification": string,
      "keyFindings": string (3 sentences),
      "priorityNeeds": [string],
      "immediateActions": [string],
      "riskFactors": [string]
    }`

    const raw = await askAI(system, prompt)
    const analysis = parseAIJSON(raw)
    
    await updateDoc(doc(db, 'reports', r.id), { aiAnalysis: analysis })
  } catch (err) {
    console.error("Analysis Failed:", err)
    alert("AI Analysis failed. Check console.")
  } finally {
    delete processing.value[r.id]
  }
}

async function runNeedsInline(r) {
  const needsId = `${r.id}_needs`
  if (processing.value[needsId]) return
  processing.value[needsId] = true

  try {
    const system = `You are an NDRRMC relief accountant. Respond ONLY with MINIFIED JSON. Use SINGLE QUOTES for internal text.`
    const prompt = `Calculate exact needs for Barangay ${r.brgy}. 
    Individuals: ${r.individuals}, Families: ${r.families}.
    
    Required JSON Schema:
    {
      "foodPacks": number,
      "waterLiters": number,
      "medicalKits": number,
      "hygieneKits": number,
      "durationDays": number,
      "totalBudgetEstimate": string,
      "adjustmentReason": string,
      "vulnerabilityNote": string,
      "priorityItems": [string]
    }`

    const raw = await askAI(system, prompt)
    const assessment = parseAIJSON(raw)
    
    await updateDoc(doc(db, 'reports', r.id), { needsAssessment: assessment })
  } catch (err) {
    console.error("Needs Assessment Failed:", err)
    alert("AI Assessment failed.")
  } finally {
    delete processing.value[needsId]
  }
}
</script>


<style scoped>
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
.fade-up { animation: fadeUp 0.4s ease forwards; }

.alert-bar  { display:flex; align-items:center; gap:10px; background:color-mix(in srgb, var(--color-danger), transparent 92%); border:1px solid color-mix(in srgb, var(--color-danger), transparent 73%); border-radius:6px; padding:10px 16px; margin-bottom:16px; }
.alert-icon { color:var(--color-danger); font-size:16px; }
.alert-text { font-size:13px; color:var(--color-danger); font-weight:600; flex:1; }
.alert-btn  { background:var(--color-danger); color:white; border:none; border-radius:4px; padding:4px 14px; font-size:12px; font-weight:600; cursor:pointer; }
.alert-btn:hover { opacity:0.85; }

.page-top   { margin-bottom:20px; }
.page-title { font-size:22px; font-weight:800; letter-spacing:-0.02em; }
.page-sub   { color:var(--text-secondary); font-size:13px; margin-top:4px; }

.stat-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.stat-box   { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:6px; padding:1.2rem; text-align:center; }
.stat-value { font-size:28px; font-weight:900; font-family:'DM Mono',monospace; line-height:1; margin-bottom:4px; }
.stat-label { font-size:11px; color:var(--text-secondary); font-family:'DM Mono',monospace; letter-spacing:0.06em; text-transform:uppercase; }

.card        { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:6px; padding:1.25rem; }
.card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.card-title  { font-size:14px; font-weight:700; }
.card-sub    { font-size:11px; color:var(--text-secondary); margin-top:2px; }

.table           { width:100%; border-collapse:collapse; }
.table-head-row  { border-bottom:1px solid var(--border-color); }
.th              { text-align:left; padding:7px 10px; font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; font-weight:400; letter-spacing:0.06em; white-space:nowrap; }
.table-row       { border-bottom:1px solid var(--border-color); transition:background .15s; }
.table-row:hover { background:var(--border-color)20; }
.td              { padding:12px 10px; vertical-align:middle; }

.badge { display:inline-block; padding:2px 10px; font-size:11px; font-family:'DM Mono',monospace; letter-spacing:0.06em; border-radius:2px; font-weight:500; white-space:nowrap; }
.sev-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.report-name { font-size:13px; font-weight:700; }
.report-meta { font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; margin-top:1px; }

.result-btn       { border-radius:6px; padding:6px 10px; cursor:pointer; text-align:left; min-width:110px; transition:all .15s; }
.result-btn:hover { filter:brightness(1.15); }
.result-btn-title { font-size:11px; font-weight:700; }
.result-btn-sub   { font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; margin-top:2px; }
.result-btn-link  { font-size:10px; color:var(--color-accent); margin-top:2px; }
.result-btn-preview { font-size:9px; color:var(--text-secondary); margin-top:2px; font-style:italic; line-height:1.2; max-width:140px; }

.loading-cell { display:flex; align-items:center; gap:8px; font-size:11px; color:var(--text-secondary); font-family:'DM Mono',monospace; }
.spinner { width:12px; height:12px; border:2px solid var(--border-color); border-top-color:var(--color-accent); border-radius:50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-btn        { background:var(--bg-body); border:1px dashed var(--border-color); border-radius:6px; padding:6px 10px; cursor:pointer; color:var(--text-secondary); font-size:11px; font-family:'DM Mono',monospace; min-width:110px; transition:all .15s; }
.empty-btn:hover  { border-color:var(--color-accent); color:var(--color-accent); }

.pipeline-dot   { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
.pipeline-count { font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; margin-top:3px; }

.two-col { display:grid; grid-template-columns:1.6fr 1fr; gap:16px; }
.report-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color); }

.ghost-btn        { display:inline-flex; align-items:center; background:transparent; border:1px solid var(--border-color); color:var(--text-primary); padding:5px 12px; border-radius:4px; font-size:12px; cursor:pointer; transition:all .2s; font-family:'Outfit',sans-serif; }
.ghost-btn:hover  { border-color:var(--color-accent)44; color:var(--color-accent); }

.inv-row  { margin-bottom:14px; }
.inv-top  { display:flex; justify-content:space-between; margin-bottom:4px; }
.progress-bg   { height:4px; background:var(--border-color); border-radius:2px; overflow:hidden; margin-top:4px; }
.progress-fill { height:100%; border-radius:2px; transition:width .8s ease; }

.pipeline-circle { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 6px; font-size:14px; }

.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: color-mix(in srgb, var(--bg-overlay), transparent 40%); 
  z-index: 10000; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  backdrop-filter: blur(14px) saturate(180%); 
  -webkit-backdrop-filter: blur(14px) saturate(180%); 
  padding: 20px;
}
.modal          { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; width:min(820px,96vw); max-height:88vh; display:flex; flex-direction:column; overflow:hidden; }
.modal-header   { padding:1rem 1.5rem; border-bottom:1px solid var(--border-color); display:flex; align-items:center; gap:12px; background:var(--bg-body); flex-shrink:0; }
.modal-title    { font-weight:800; font-size:15px; }
.modal-sub      { font-size:11px; color:var(--text-secondary); font-family:'DM Mono',monospace; }
.close-btn      { background:none; border:1px solid var(--border-color); color:var(--text-secondary); width:28px; height:28px; border-radius:4px; font-size:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
.close-btn:hover{ border-color:var(--color-danger)44; color:var(--color-danger); }
.modal-tabs     { display:flex; border-bottom:1px solid var(--border-color); background:var(--bg-body); flex-shrink:0; }
.modal-tab      { padding:10px 20px; background:none; border:none; border-bottom:2px solid transparent; font-size:12px; cursor:pointer; margin-bottom:-1px; transition:all .15s; font-family:'Outfit',sans-serif; }
.modal-body     { overflow-y:auto; flex:1; padding:1.5rem; }
.score-box      { background:var(--bg-body); border:1px solid var(--border-color); border-radius:6px; padding:14px 18px; }
.score-label    { font-size:10px; color:var(--text-secondary); font-family:'DM Mono',monospace; letter-spacing:0.08em; margin-bottom:4px; }
.score-value    { font-size:22px; font-weight:900; line-height:1; margin-bottom:2px; }
.score-sub      { font-size:11px; color:var(--text-secondary); margin-bottom:6px; }
.field-label    { font-size:11px; color:var(--text-secondary); font-family:'DM Mono',monospace; letter-spacing:0.06em; margin-bottom:4px; }
.findings-box   { font-size:13px; line-height:1.75; padding:10px 14px; background:var(--bg-body); border-left:3px solid var(--color-accent); border-radius:4px; white-space:pre-wrap; }
.divider        { height:1px; background:var(--border-color); margin:1rem 0; }
.two-col-sm     { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.three-col      { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.empty-state    { text-align:center; padding:3rem; color:var(--text-secondary); font-size:13px; display:flex; flex-direction:column; align-items:center; }

/* ── EXPERT MODAL STYLES ── */
.score-grid-large { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.analysis-score-card { background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; }
.score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.score-level-badge { padding: 4px 10px; font-size: 10px; font-weight: 800; border-radius: 4px; font-family: 'DM Mono', monospace; }
.score-main { margin-bottom: 16px; }
.score-num { font-size: 32px; font-weight: 800; color: var(--text-primary); }
.score-max { font-size: 14px; color: var(--text-secondary); margin-left: 2px; }
.progress-bg { height: 6px; background: var(--bg-surface); border-radius: 3px; margin-top: 8px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 1s ease; }
.factor-box { display: flex; flex-direction: column; gap: 8px; }
.factor-item { font-size: 11px; line-height: 1.5; color: var(--text-dim); }
.f-lbl { font-weight: 700; color: var(--text-secondary); margin-right: 4px; }
.t-warn { color: var(--color-warn); }

.paragraph-text { font-size: 13.5px; line-height: 1.6; color: var(--text-primary); margin-bottom: 16px; }

.findings-container { display: flex; flex-direction: column; gap: 16px; }
.finding-block { border-left: 2px solid var(--border-color); padding-left: 12px; }
.f-key { font-size: 11px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
.f-val { font-size: 13px; line-height: 1.6; color: var(--text-dim); }

.timeline-box { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; padding: 16px; margin-top: 8px; }
.timeline-title { font-size: 10px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
.timeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.t-col { display: flex; flex-direction: column; gap: 6px; }
.t-hour { font-size: 9px; font-weight: 800; color: var(--text-primary); background: var(--border-color); padding: 4px 8px; border-radius: 3px; align-self: flex-start; }
.t-desc { font-size: 11.5px; line-height: 1.4; color: var(--text-secondary); }

.needs-grid-detailed { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.need-detail-card { background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; }
.n-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.n-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.n-actor { font-size: 9px; padding: 2px 6px; background: color-mix(in srgb, var(--color-accent), transparent 93%); color: var(--color-accent); border: 1px solid color-mix(in srgb, var(--color-accent), transparent 80%); border-radius: 4px; font-family: 'DM Mono', monospace; }
.n-info { font-size: 12px; line-height: 1.5; color: var(--text-dim); margin-bottom: 6px; }
.n-lbl { font-weight: 700; color: var(--text-secondary); }
.t-danger { color: var(--color-danger); }

.action-phases { display: flex; flex-direction: column; gap: 12px; }
.phase-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
.phase-hdr { background: var(--border-color); padding: 8px 16px; font-size: 11px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; }
.phase-body { padding: 12px 16px; }
.p-item { font-size: 12px; margin-bottom: 6px; color: var(--text-dim); line-height: 1.5; }

.risk-matrix-row { display: flex; gap: 16px; padding: 16px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px; }
.rm-main { flex: 1; }
.rm-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.rm-icon { color: var(--color-danger); font-size: 18px; }
.rm-trigger { font-size: 12px; color: var(--text-secondary); font-style: italic; }
.rm-mitigation { flex: 1.2; border-left: 1px solid var(--border-color); padding-left: 20px; }
.rm-m-lbl { font-size: 10px; font-weight: 700; color: var(--color-success); margin-bottom: 4px; text-transform: uppercase; }

.score-box-premium { border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: transform 0.2s; }
.score-box-premium:hover { transform: translateY(-2px); }
.sb-lbl { font-size: 11px; color: var(--text-secondary); font-family: 'DM Mono', monospace; margin-bottom: 4px; letter-spacing: 0.05em; font-weight: 600; }
.sb-val { font-weight: 900; line-height: 1.1; margin-bottom: 2px; letter-spacing: -0.02em; }
.sb-sub { font-size: 11px; color: var(--text-secondary); font-family: 'DM Mono', monospace; opacity: 0.8; }

.vuln-box-premium { background: color-mix(in srgb, var(--color-high), transparent 88%); border: 1px solid color-mix(in srgb, var(--color-high), transparent 60%); border-radius: 8px; padding: 12px 16px; color: var(--color-high); font-size: 14px; line-height: 1.5; font-weight: 600; display: flex; align-items: flex-start; box-shadow: 0 4px 12px color-mix(in srgb, var(--color-high), transparent 90%); }

.reasoning-grid-premium { display: flex; flex-direction: column; gap: 8px; }
.reason-pill { background: linear-gradient(145deg, var(--bg-surface), var(--bg-body)); border: 1px solid var(--border-color); border-left: 3px solid var(--color-accent); border-radius: 8px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.2s; }
.reason-pill:hover { border-color: color-mix(in srgb, var(--color-accent), transparent 70%); transform: translateX(4px); }
.rp-key { font-size: 11px; text-transform: uppercase; color: var(--color-accent); font-weight: 800; margin-bottom: 4px; letter-spacing: 0.05em; }
.rp-val { font-size: 13px; line-height: 1.5; color: var(--text-primary); }

.tag-premium { display: inline-block; padding: 3px 10px; background: color-mix(in srgb, var(--color-success), transparent 90%); border: 1px solid color-mix(in srgb, var(--color-success), transparent 80%); color: var(--color-success); font-size: 11px; font-family: 'DM Mono', monospace; border-radius: 4px; margin-right: 8px; margin-bottom: 8px; }
.pill-legacy { padding: 4px 12px; background: var(--border-color); color: var(--text-primary); border-radius: 20px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; border: 1px solid var(--border-color); }

/* ── Matching Specific Premium Styles ── */
.matching-table-premium { width: 100%; border-collapse: collapse; margin-top: 8px; }
.matching-table-premium th { text-align: left; padding: 12px 8px; font-size: 10px; color: var(--text-secondary); font-family: 'DM Mono', monospace; text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
.matching-table-premium td { padding: 12px 8px; border-bottom: 1px solid color-mix(in srgb, var(--border-color), transparent 87%); font-size: 13px; }
.mono-cyan { font-family: 'DM Mono', monospace; color: var(--color-accent); font-weight: 600; }

.step-card-premium { display: flex; align-items: flex-start; gap: 12px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 16px; margin-bottom: 8px; }
.step-num-premium { width: 20px; height: 20px; background: color-mix(in srgb, var(--color-accent), transparent 90%); border: 1px solid color-mix(in srgb, var(--color-accent), transparent 80%); color: var(--color-accent); font-size: 10px; font-weight: 800; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.step-text-premium { font-size: 12.5px; color: var(--text-primary); line-height: 1.5; }

.gap-card-premium { display: flex; align-items: center; background: var(--color-danger)0a; border: 1px solid var(--color-danger)22; border-radius: 6px; padding: 10px 16px; margin-bottom: 6px; }
.classification-grid { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; background: var(--bg-surface); padding: 0; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
.class-item { display: grid; grid-template-columns: 240px 1fr; column-gap: 40px; padding: 18px 24px; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
.class-item:hover { background: color-mix(in srgb, var(--color-accent), transparent 98%); }
.class-item:last-child { border-bottom: none; }
.class-key { font-weight: 800; color: var(--color-accent); text-transform: uppercase; font-size: 10px; font-family: 'Outfit', sans-serif; letter-spacing: 0.08em; line-height: 1.5; padding-top: 2px; }
.class-val { color: var(--text-primary); font-size: 13.5px; line-height: 1.6; font-weight: 500; }

</style>