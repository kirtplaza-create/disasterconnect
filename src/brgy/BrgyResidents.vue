<template>
  <div>

    <!-- ════════════════════════════════════════════════════
         ADD / EDIT MODAL
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showModal" class="dc-overlay">
        <div class="dc-modal">

          <!-- Header -->
          <div class="dc-modal-head">
            <div>
              <div class="dc-modal-title">
                <Pencil v-if="editTarget" :size="16" style="display:inline; margin-right:6px;" />
                <Users v-else :size="16" style="display:inline; margin-right:6px;" />
                {{ editTarget ? 'Edit Family' : 'Add Resident Family' }}
              </div>
              <div class="dc-modal-sub">Step {{ step }} of 5</div>
            </div>
            <button class="dc-icon-close" @click="closeModal"><X :size="16" /></button>
          </div>

          <!-- Body -->
          <div class="dc-modal-body">

            <!-- Step bar -->
            <div class="dc-stepbar">
              <template v-for="(label, i) in ['Basic','Members','Needs','Status','Photo']" :key="i">
                <div class="dc-step-item">
                  <div class="dc-step-dot"
                    :style="stepDotStyle(i+1)">
                    <Check v-if="step > i+1" :size="14" />
                    <span v-else>{{ i+1 }}</span>
                  </div>
                  <span class="dc-step-lbl" :style="step===i+1?'color:#FFD23F;font-weight:700':'color:#4A6080'">{{ label }}</span>
                </div>
                <div v-if="i < 4" class="dc-step-line"
                  :style="step > i+2 ? 'background:#FFD23F' : 'background:#1A2535'"></div>
              </template>
            </div>

            <!-- ── STEP 1: Basic Info ── -->
            <div v-if="step===1">
              <div class="dc-step-title">Step 1: Family Information</div>

              <div class="dc-field">
                <label class="dc-label">FAMILY NAME <span style="color:#FF3B5C">*</span></label>
                <input v-model="form.familyName" placeholder="e.g. HAYA" class="dc-input"
                  @focus="e=>e.target.style.borderColor='#FFD23F'"
                  @blur="e=>e.target.style.borderColor='#1A2535'" />
              </div>

              <div class="dc-field">
                <label class="dc-label">CONTACT NO. OF REPRESENTATIVE <span style="color:#FF3B5C">*</span></label>
                <input v-model="form.contactNo" placeholder="e.g. 09700201422" class="dc-input"
                  @focus="e=>e.target.style.borderColor='#FFD23F'"
                  @blur="e=>e.target.style.borderColor='#1A2535'" />
              </div>

              <div class="dc-field">
                <label class="dc-label">STATUS</label>
                <div class="dc-toggle-row">
                  <button v-for="s in STATUS_OPTS" :key="s"
                    class="dc-toggle"
                    :style="form.status===s ? 'border-color:#FFD23F;background:#FFD23F18;color:#FFD23F;font-weight:700' : 'border-color:#1A2535;background:transparent;color:#4A6080'"
                    @click="form.status=s">{{ s }}</button>
                </div>
              </div>
            </div>

            <!-- ── STEP 2: Members ── -->
            <div v-if="step===2">
              <div class="dc-step-title">Step 2: Full Name of Members</div>
              <div class="dc-members-head">
                <span style="width:28px;font-size:11px;color:#4A6080;font-family:monospace">#</span>
                <span style="flex:1;font-size:11px;color:#4A6080;font-family:monospace;letter-spacing:.06em">FULL NAME</span>
                <span style="width:80px;font-size:11px;color:#4A6080;font-family:monospace;letter-spacing:.06em">AGE</span>
                <span style="width:36px"></span>
              </div>
              <div v-for="(m,i) in form.members" :key="i" class="dc-member-row">
                <div class="dc-member-num">{{ i+1 }}</div>
                <input v-model="m.fullName" :placeholder="`Member ${i+1}`" class="dc-input"
                  style="flex:1"
                  @focus="e=>e.target.style.borderColor='#FFD23F'"
                  @blur="e=>e.target.style.borderColor='#1A2535'" />
                <input v-model="m.age" type="number" placeholder="Age" class="dc-input"
                  style="width:80px"
                  @focus="e=>e.target.style.borderColor='#FFD23F'"
                  @blur="e=>e.target.style.borderColor='#1A2535'" />
                <button class="dc-del-btn" :disabled="form.members.length===1" @click="removeMember(i)"><X :size="14" /></button>
              </div>
              <button class="dc-add-member-btn" @click="addMember">+ Add Another Member</button>
            </div>

            <!-- ── STEP 3: Needs ── -->
            <div v-if="step===3">
              <div class="dc-step-title">Step 3: What Are Their Needs?</div>
              <div class="dc-needs-grid">
                <button v-for="n in NEEDS_OPTS" :key="n"
                  class="dc-need-card"
                  :style="form.needs.includes(n)
                    ? 'border-color:#FFD23F;background:#FFD23F12'
                    : 'border-color:#1A2535;background:transparent'"
                  @click="toggleNeed(n)">
                  <div class="dc-need-check"
                    :style="form.needs.includes(n)
                      ? 'border-color:#FFD23F;background:#FFD23F;color:#060A0F'
                      : 'border-color:#4A6080;background:transparent;color:transparent'"><Check v-if="form.needs.includes(n)" :size="14" /></div>
                  <component :is="{Food:Box,Water:Droplet,Medicine:Stethoscope,Blanket:Bed}[n]" :size="20" :color="form.needs.includes(n)?'#FFD23F':'#4A6080'" />
                  <span :style="form.needs.includes(n)?'color:#FFD23F;font-weight:700':'color:#E2EAF4'">{{ n }}</span>
                </button>
              </div>
              <div class="dc-field">
                <label class="dc-label">OTHER NEEDS (OPTIONAL)</label>
                <textarea v-model="form.otherNeeds" rows="2" placeholder="Any other specific needs..." class="dc-textarea"
                  @focus="e=>e.target.style.borderColor='#FFD23F'"
                  @blur="e=>e.target.style.borderColor='#1A2535'"></textarea>
              </div>
            </div>

            <!-- ── STEP 4: Status & Vulnerable ── -->
            <div v-if="step===4">
              <div class="dc-step-title">Step 4: Status &amp; Vulnerable Groups</div>
              <div class="dc-field">
                <label class="dc-label">CURRENT STATUS</label>
                <div class="dc-toggle-row">
                  <button v-for="s in STATUS_OPTS" :key="s"
                    class="dc-toggle"
                    :style="form.status===s ? 'border-color:#FFD23F;background:#FFD23F18;color:#FFD23F;font-weight:700' : 'border-color:#1A2535;background:transparent;color:#4A6080'"
                    @click="form.status=s">{{ s }}</button>
                </div>
              </div>
              <div class="dc-field">
                <label class="dc-label">VULNERABLE GROUPS (SELECT ALL THAT APPLY)</label>
                <div class="dc-toggle-row" style="flex-wrap:wrap">
                  <button v-for="v in VULN_OPTS" :key="v"
                    class="dc-toggle"
                    :style="form.vulnerableGroups.includes(v)
                      ? 'border-color:#FF3B5C;background:#FF3B5C12;color:#FF3B5C;font-weight:700'
                      : 'border-color:#1A2535;background:transparent;color:#4A6080'"
                    @click="toggleVuln(v)"><Check v-if="form.vulnerableGroups.includes(v)" :size="12" style="margin-right:4px;" />{{ v }}</button>
                </div>
              </div>

              <!-- Summary preview -->
              <div class="dc-summary-box">
                <div class="dc-label" style="margin-bottom:10px">SUMMARY</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
                  <div v-for="([k,v]) in [['Family Name',form.familyName||'—'],['Contact',form.contactNo||'—'],['Members',`${form.members.filter(m=>m.fullName).length} person(s)`],['Status',form.status]]" :key="k">
                    <div style="font-size:10px;color:#4A6080">{{ k }}</div>
                    <div style="font-size:13px;font-weight:600;color:#E2EAF4">{{ v }}</div>
                  </div>
                </div>
                <div v-if="form.needs.length>0">
                  <div class="dc-label" style="margin-bottom:4px">NEEDS</div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <span v-for="n in form.needs" :key="n" class="dc-badge dc-badge-yellow">{{ n }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── STEP 5: Camera ── -->
            <div v-if="step===5">
              <div class="dc-step-title"><Camera :size="16" style="display:inline; margin-right:6px;" /> Step 5: Representative Verification Photo</div>
              <div class="dc-camera-notice">
                Take a photo of the family representative being interviewed. This serves as proof of data collection and is <strong>required</strong> before saving.
              </div>

              <!-- Photo preview -->
              <div v-if="photo" style="display:flex;flex-direction:column;align-items:center;gap:14px">
                <div style="position:relative;border-radius:12px;overflow:hidden;border:3px solid #00E5A0;width:100%;max-width:400px">
                  <img :src="photo" style="width:100%;display:block" />
                  <div style="position:absolute;top:10px;left:10px;background:#00E5A0;color:#060A0F;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:4px"><Check :size="14" /> Photo Verified</div>
                  <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.6));padding:20px 14px 10px;font-size:11px;color:#fff;font-family:monospace">REPRESENTATIVE INTERVIEW CAPTURED</div>
                </div>
                <button class="dc-btn-outline sm" @click="photo=null"><RefreshCcw :size="14" /> Retake Photo</button>
              </div>

              <!-- Camera UI -->
              <div v-else style="display:flex;flex-direction:column;align-items:center;gap:12px">
                <div class="dc-viewfinder" :style="streaming?'border-color:#FFD23F':''">
                  <video ref="videoRef" style="width:100%;height:100%;object-fit:cover" :style="streaming?'display:block':'display:none'" muted playsinline autoplay></video>

                  <div v-if="countdown!==null" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4)">
                    <div style="font-size:80px;font-weight:900;color:#FFD23F;font-family:monospace;text-shadow:0 0 30px #FFD23F">{{ countdown }}</div>
                  </div>

                  <div v-if="streaming && countdown===null" style="position:absolute;inset:20px;border:2px dashed #FFD23F55;border-radius:8px;pointer-events:none">
                    <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:10px;color:#FFD23Faa;font-family:monospace;letter-spacing:.08em">POSITION REPRESENTATIVE IN FRAME</div>
                  </div>

                  <div v-if="!streaming" style="text-align:center;color:#4A6080;padding:2rem">
                    <div style="margin-bottom:10px"><Camera :size="48" color="#4A6080" /></div>
                    <div style="font-size:13px;font-weight:600;color:#E2EAF4">Camera ready</div>
                    <div style="font-size:11px;margin-top:4px">Press "Open Camera" to begin</div>
                  </div>
                </div>

                <canvas ref="canvasRef" style="display:none"></canvas>

                <div v-if="cameraError" style="font-size:12px;color:#FF3B5C;text-align:center;max-width:380px;padding:8px 12px;background:#FF3B5C12;border:1px solid #FF3B5C33;border-radius:6px;display:flex;align-items:center;gap:6px"><AlertTriangle :size="14" /> {{ cameraError }}</div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
                  <template v-if="!streaming">
                    <button class="dc-btn-primary" @click="startCamera"><Camera :size="14" /> Open Camera</button>
                  </template>
                  <template v-else>
                    <button class="dc-btn-green" @click="captureNow"><Camera :size="14" /> Capture Now</button>
                    <button class="dc-btn-outline sm" @click="timedCapture"><Timer :size="14" /> 3s Timer</button>
                    <button class="dc-btn-ghost sm" @click="switchCam"><RefreshCcw :size="14" /> Flip</button>
                    <button class="dc-btn-ghost sm" style="color:#FF3B5C" @click="stopCamera"><X :size="14" /> Stop</button>
                  </template>
                </div>

                <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:400px">
                  <div style="flex:1;height:1px;background:#1A2535"></div>
                  <span style="font-size:11px;color:#4A6080">or upload a photo</span>
                  <div style="flex:1;height:1px;background:#1A2535"></div>
                </div>
                <label class="dc-upload-label">
                  <FolderOpen :size="14" /> Browse file (JPG, PNG)
                  <input type="file" accept="image/*" style="display:none" @change="onFileUpload" />
                </label>
              </div>
            </div>

            <!-- Navigation -->
            <div class="dc-modal-nav">
              <button v-if="step>1" class="dc-btn-ghost" @click="step--"><ArrowLeft :size="16" /> Back</button>
              <div v-else></div>
              <button v-if="step<5" class="dc-btn-primary" :disabled="!canNext" @click="step++">Next <ArrowRight :size="16" /></button>
              <button v-else class="dc-btn-green" :disabled="!canSave" @click="saveFamily">
                <span v-if="isSaving" class="dc-spinner"></span>
                <Check v-if="!isSaving" :size="16" /> {{ isSaving ? 'Saving...' : (editTarget ? 'Save Changes' : 'Save Family') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════
         DETAIL MODAL
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="detailFamily" class="dc-overlay" @click.self="detailFamily=null">
        <div class="dc-modal">
          <div class="dc-modal-head" style="position:sticky;top:0;background:#0D1219;z-index:10">
            <div>
              <div style="font-size:18px;font-weight:900;color:#FFD23F">Family {{ detailFamily.familyName }}</div>
              <div style="font-size:12px;color:#4A6080;margin-top:2px">{{ detailFamily.id }}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="dc-btn-outline sm" @click="requestEdit(detailFamily)"><Pencil :size="14" /> Edit</button>
              <button class="dc-btn-danger sm" @click="showDeleteConfirm=true"><Trash2 :size="14" /> Remove</button>
              <button class="dc-icon-close" @click="detailFamily=null"><X :size="16" /></button>
            </div>
          </div>
          <div class="dc-modal-body">

            <!-- Photo row -->
            <div v-if="detailFamily.photo" style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px">
              <div style="flex-shrink:0">
                <div class="dc-label" style="margin-bottom:6px">REPRESENTATIVE PHOTO</div>
                <img :src="detailFamily.photo" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:2px solid #00E5A044;display:block" />
                <div style="font-size:10px;color:#00E5A0;margin-top:4px;text-align:center;display:flex;align-items:center;justify-content:center;gap:4px"><Check :size="12" /> Verified</div>
              </div>
              <div style="flex:1">
                <div class="dc-label" style="margin-bottom:8px">BASIC INFORMATION</div>
                <div class="dc-info-grid">
                  <div class="dc-info-cell" v-for="([k,v]) in [['Family Name',detailFamily.familyName],['Contact No.',detailFamily.contactNo]]" :key="k">
                    <div style="font-size:10px;color:#4A6080;margin-bottom:2px">{{ k }}</div>
                    <div style="font-size:14px;font-weight:700;color:#E2EAF4">{{ v||'—' }}</div>
                  </div>
                </div>
                <span class="dc-badge" :style="statusBadgeStyle(detailFamily.status)" style="margin-top:8px;display:inline-block">{{ detailFamily.status }}</span>
              </div>
            </div>
            <div v-else style="margin-bottom:16px">
              <div class="dc-label" style="margin-bottom:10px">BASIC INFORMATION</div>
              <div class="dc-info-grid" style="margin-bottom:10px">
                <div class="dc-info-cell" v-for="([k,v]) in [['Family Name',detailFamily.familyName],['Contact No.',detailFamily.contactNo]]" :key="k">
                  <div style="font-size:10px;color:#4A6080;margin-bottom:2px">{{ k }}</div>
                  <div style="font-size:14px;font-weight:700;color:#E2EAF4">{{ v||'—' }}</div>
                </div>
              </div>
              <span class="dc-badge" :style="statusBadgeStyle(detailFamily.status)">{{ detailFamily.status }}</span>
            </div>

            <div class="dc-divider"></div>

            <!-- Members -->
            <div style="margin-bottom:16px">
              <div class="dc-label" style="margin-bottom:10px">FAMILY MEMBERS ({{ detailFamily.members.length }})</div>
              <div v-for="(m,i) in detailFamily.members" :key="i" class="dc-member-detail">
                <div class="dc-member-num">{{ i+1 }}</div>
                <span style="font-size:13px;font-weight:600;color:#E2EAF4">{{ m.fullName }}</span>
                <span v-if="m.age" class="dc-badge dc-badge-muted" style="margin-left:auto">Age {{ m.age }}</span>
              </div>
            </div>

            <!-- Needs -->
            <template v-if="detailFamily.needs&&detailFamily.needs.length>0||detailFamily.otherNeeds">
              <div class="dc-divider"></div>
              <div style="margin-bottom:16px">
                <div class="dc-label" style="margin-bottom:10px">NEEDS</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <span v-for="n in detailFamily.needs" :key="n" class="dc-badge dc-badge-yellow">{{ n }}</span>
                </div>
                <div v-if="detailFamily.otherNeeds" style="font-size:12px;color:#4A6080;margin-top:8px;font-style:italic">Other: {{ detailFamily.otherNeeds }}</div>
              </div>
            </template>

            <!-- Vulnerable Groups -->
            <template v-if="detailFamily.vulnerableGroups&&detailFamily.vulnerableGroups.length>0">
              <div class="dc-divider"></div>
              <div>
                <div class="dc-label" style="margin-bottom:10px">VULNERABLE GROUPS</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <span v-for="v in detailFamily.vulnerableGroups" :key="v" class="dc-badge dc-badge-red">{{ v }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════
         EDIT AUTH MODAL
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showEditAuth" class="dc-overlay" style="z-index:500">
        <div class="dc-auth-modal">
          <div style="text-align:center;margin-bottom:20px">
            <div style="margin-bottom:8px"><Lock :size="36" color="#FFD23F" /></div>
            <div style="font-size:17px;font-weight:900;color:#FFD23F;margin-bottom:6px">Authentication Required</div>
            <div style="font-size:13px;color:#4A6080;line-height:1.7">
              You are about to edit <strong style="color:#E2EAF4">Family {{ pendingEditFamily?.familyName }}</strong>.<br>
              Enter your barangay password to continue.
            </div>
          </div>
          <div class="dc-label" style="margin-bottom:6px">BARANGAY PASSWORD</div>
          <input type="password" v-model="editPwd" placeholder="Enter password to confirm"
            autofocus @keydown.enter="confirmEdit"
            class="dc-input" :style="editErr?'border-color:#FF3B5C':''"
            @focus="e=>e.target.style.borderColor='#FFD23F'"
            @blur="e=>e.target.style.borderColor=editErr?'#FF3B5C':'#1A2535'" />
          <div v-if="editErr" style="font-size:12px;color:#FF3B5C;margin-top:6px">{{ editErr }}</div>
          <div class="dc-modal-nav" style="margin-top:16px">
            <button class="dc-btn-ghost" @click="showEditAuth=false;editPwd='';editErr=''">Cancel</button>
            <button class="dc-btn-primary" :disabled="!editPwd" @click="confirmEdit"><Pencil :size="14" /> Confirm Edit</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════
         DELETE AUTH MODAL
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="dc-overlay" style="z-index:500">
        <div class="dc-auth-modal" style="border-color:#FF3B5C44">
          <div style="text-align:center;margin-bottom:20px">
            <div style="margin-bottom:8px"><Trash2 :size="36" color="#FF3B5C" /></div>
            <div style="font-size:17px;font-weight:900;color:#FF3B5C;margin-bottom:6px">Authentication Required</div>
            <div style="font-size:13px;color:#4A6080;line-height:1.7">
              You are about to permanently remove <strong style="color:#E2EAF4">Family {{ detailFamily?.familyName }}</strong>.<br>
              Enter your barangay password to confirm.
            </div>
          </div>
          <div class="dc-label" style="margin-bottom:6px">BARANGAY PASSWORD</div>
          <input type="password" v-model="deletePwd" placeholder="Enter password to confirm"
            autofocus @keydown.enter="confirmDelete"
            class="dc-input" :style="deleteErr?'border-color:#FF3B5C':''"
            @focus="e=>e.target.style.borderColor='#FFD23F'"
            @blur="e=>e.target.style.borderColor=deleteErr?'#FF3B5C':'#1A2535'" />
          <div v-if="deleteErr" style="font-size:12px;color:#FF3B5C;margin-top:6px">{{ deleteErr }}</div>
          <div class="dc-modal-nav" style="margin-top:16px">
            <button class="dc-btn-ghost" @click="showDeleteConfirm=false;deletePwd='';deleteErr=''">Cancel</button>
            <button class="dc-btn-danger" :disabled="!deletePwd" @click="confirmDelete"><Trash2 :size="14" /> Confirm Remove</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════
         PAGE CONTENT
    ═══════════════════════════════════════════════════════ -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div>
        <h1 style="font-size:22px;font-weight:900;color:#E2EAF4">Resident List</h1>
        <p style="color:#4A6080;font-size:13px;margin-top:4px">Manage registered families and track their information</p>
      </div>
      <button class="dc-btn-primary" @click="openAdd"><Plus :size="16" /> Add Family</button>
    </div>

    <!-- Stat boxes -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <div class="dc-stat" v-for="s in statBoxes" :key="s.label">
        <div class="dc-stat-glow" :style="`background:${s.color}08`"></div>
        <div style="margin-bottom:8px"><component :is="s.icon" :size="20" :color="s.color" /></div>
        <div style="font-size:28px;font-weight:900;line-height:1;font-family:monospace" :style="`color:${s.color}`">{{ s.value }}</div>
        <div style="font-size:11px;color:#4A6080;font-family:monospace;letter-spacing:.06em;text-transform:uppercase;margin-top:4px">{{ s.label }}</div>
      </div>
    </div>

    <!-- Search -->
    <div style="margin-bottom:14px">
      <div style="position:relative">
        <Search :size="14" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#4A6080" />
        <input v-model="search" placeholder="Search by family name..."
          style="width:100%;background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:10px 16px 10px 40px;color:#E2EAF4;font-size:13px;outline:none;transition:border-color .2s;box-sizing:border-box"
          @focus="e=>e.target.style.borderColor='#FFD23F'"
          @blur="e=>e.target.style.borderColor='#1A2535'" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length===0" style="text-align:center;padding:5rem;color:#4A6080;display:flex;flex-direction:column;align-items:center">
      <div style="margin-bottom:12px"><Users :size="40" color="#4A6080" /></div>
      <div style="font-size:15px;font-weight:700;margin-bottom:6px;color:#E2EAF4">
        {{ localResidents.length===0 ? 'No families registered yet' : 'No results found' }}
      </div>
      <div style="font-size:13px;margin-bottom:20px">
        {{ localResidents.length===0 ? "Click '+ Add Family' to register the first family." : 'Try a different search term.' }}
      </div>
      <button v-if="localResidents.length===0" class="dc-btn-primary" @click="openAdd"><Plus :size="16" /> Add First Family</button>
    </div>

    <!-- Family list -->
    <div v-else style="display:flex;flex-direction:column;gap:8px">
      <div v-for="f in filtered" :key="f.id" class="dc-family-card" @click="detailFamily=f">
        <div class="dc-family-avatar"><Users :size="20" color="#FFD23F" /></div>
        <div style="flex:1">
          <div style="font-size:16px;font-weight:800;color:#FFD23F;margin-bottom:3px">{{ f.familyName }}</div>
          <div style="font-size:12px;color:#4A6080">
            {{ f.members.length }} member{{ f.members.length!==1?'s':'' }}{{ f.contactNo?' · '+f.contactNo:'' }}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          <span v-if="f.vulnerableGroups&&f.vulnerableGroups.length>0" class="dc-badge dc-badge-red" style="display:flex;align-items:center;gap:4px"><AlertTriangle :size="10" /> Vulnerable</span>
          <span v-if="f.needs&&f.needs.length>0" class="dc-badge dc-badge-yellow">{{ f.needs.length }} need{{ f.needs.length!==1?'s':'' }}</span>
          <span class="dc-badge" :style="statusBadgeStyle(f.status)">{{ f.status }}</span>
          <ChevronRight :size="18" color="#4A6080" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase.js'
import { 
  Pencil, 
  Users, 
  X, 
  Check, 
  Box, 
  Droplet, 
  Stethoscope, 
  Bed, 
  Camera, 
  RefreshCcw, 
  AlertTriangle, 
  Timer, 
  FolderOpen, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Lock, 
  Plus, 
  Home, 
  Footprints, 
  Search, 
  ChevronRight 
} from 'lucide-vue-next'

// ── Props & Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  residents: { type: Array, default: () => [] },
  // Allow parent to trigger openAdd (e.g. from dashboard button)
  triggerAdd: { type: Boolean, default: false },
})
const emit = defineEmits(['update:triggerAdd'])

// ── Internal reactive list ────────────────────────────────────────────────────
// Now that data is synced via onSnapshot in App.vue, we use props.residents directly 
// for display, but localResidents is used for filtering.
const localResidents = computed(() => props.residents)

// Watch for parent triggering add
watch(() => props.triggerAdd, (val) => {
  if (val) { openAdd(); emit('update:triggerAdd', false) }
})

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTS = ['At Home','Evacuated','Missing','Relocated']
const NEEDS_OPTS  = ['Food','Water','Medicine','Blanket']
const VULN_OPTS   = ['Elderly','Children','Pregnant','Disabled','PWD','Solo Parent']
const ADMIN_PWD   = 'brgy2025'

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal    = ref(false)
const editTarget   = ref(null)
const detailFamily = ref(null)
const step         = ref(1)
const photo        = ref(null)
const isSaving     = ref(false) // add loading state to prevent double clicks

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  familyName: '', contactNo: '', status: 'At Home',
  members: [{ fullName:'', age:'' }],
  needs: [], otherNeeds: '', vulnerableGroups: [],
})

const resetForm = () => {
  form.familyName  = ''
  form.contactNo   = ''
  form.status      = 'At Home'
  form.members     = [{ fullName:'', age:'' }]
  form.needs       = []
  form.otherNeeds  = ''
  form.vulnerableGroups = []
  photo.value      = null
  step.value       = 1
  isSaving.value   = false
}

// ── Open/Close ────────────────────────────────────────────────────────────────
const openAdd = () => {
  editTarget.value = null
  resetForm()
  showModal.value  = true
}

const openEdit = (f) => {
  detailFamily.value     = null
  editTarget.value       = f
  form.familyName        = f.familyName      || ''
  form.contactNo         = f.contactNo       || ''
  form.status            = f.status          || 'At Home'
  form.otherNeeds        = f.otherNeeds      || ''
  form.members           = (f.members||[]).length
                            ? f.members.map(m => ({ fullName: m.fullName||'', age: m.age||'' }))
                            : [{ fullName:'', age:'' }]
  form.needs             = [...(f.needs||[])]
  form.vulnerableGroups  = [...(f.vulnerableGroups||[])]
  photo.value            = f.photo || null
  step.value             = 1
  showModal.value        = true
}

const closeModal = () => {
  showModal.value  = false
  editTarget.value = null
  stopCamera()
}

// ── Members helpers ───────────────────────────────────────────────────────────
const addMember    = ()    => form.members.push({ fullName:'', age:'' })
const removeMember = (i)   => { if (form.members.length > 1) form.members.splice(i, 1) }
const toggleNeed   = (n)   => { const i = form.needs.indexOf(n); i>=0 ? form.needs.splice(i,1) : form.needs.push(n) }
const toggleVuln   = (v)   => { const i = form.vulnerableGroups.indexOf(v); i>=0 ? form.vulnerableGroups.splice(i,1) : form.vulnerableGroups.push(v) }

// ── Validation ────────────────────────────────────────────────────────────────
const canNext = computed(() => {
  if (step.value===1) return !!(form.familyName.trim() && form.contactNo.trim())
  if (step.value===2) return form.members.some(m => m.fullName.trim())
  return true
})
const canSave = computed(() => (!!editTarget.value || !!photo.value) && !isSaving.value)

// ── Save family ───────────────────────────────────────────────────────────────
// ── Save family ───────────────────────────────────────────────────────────────
const saveFamily = async () => {
  if (!form.familyName.trim()) return
  isSaving.value = true
  console.log("%c[DC] Saving family (Direct Mode)...", "color:#FFD23F;font-weight:bold", form.familyName)

  const entryId = editTarget.value?.id || `FAM-${Date.now()}`

  try {
    // 1. Prepare entry object (Saving photo directly as Base64 string to Firestore)
    const entry = {
      id:               entryId,
      familyName:       String(form.familyName).trim(),
      contactNo:        String(form.contactNo).trim(),
      status:           String(form.status),
      otherNeeds:       String(form.otherNeeds || ''),
      photo:            photo.value || null, // Direct Base64 string
      members:          form.members
                          .filter(m => m.fullName.trim())
                          .map(m => ({ fullName: String(m.fullName).trim(), age: String(m.age||'') })),
      needs:            form.needs.map(n => String(n)),
      vulnerableGroups: form.vulnerableGroups.map(v => String(v)),
      updatedAt:        new Date().toISOString()
    }

    // 2. Save to Firestore
    console.log("[DC] Writing record to Firestore: residents/" + entry.id)
    await setDoc(doc(db, 'residents', entry.id), entry)
    console.log("[DC] Database write successful!")

    // 3. Update local state
    if (detailFamily.value?.id === entry.id) {
      detailFamily.value = entry
    }

    // 4. Cleanup
    closeModal()
    resetForm()
    console.log("%c[DC] SAVE COMPLETE", "color:#00E5A0;font-weight:bold")
  } catch (error) {
    console.error("%c[DC] SAVE ERROR:", "color:#FF3B5C;font-weight:bold", error)
    alert(`System Error: ${error.message}\n\nWe tried to save directly but something went wrong. Check your internet connection.`)
  } finally {
    isSaving.value = false
  }
}

// ── Edit auth ─────────────────────────────────────────────────────────────────
const showEditAuth      = ref(false)
const editPwd           = ref('')
const editErr           = ref('')
const pendingEditFamily = ref(null)

const requestEdit = (f) => {
  pendingEditFamily.value = f
  editPwd.value           = ''
  editErr.value           = ''
  showEditAuth.value      = true
}
const confirmEdit = () => {
  if (editPwd.value === ADMIN_PWD) {
    showEditAuth.value = false
    editPwd.value      = ''
    openEdit(pendingEditFamily.value)
    pendingEditFamily.value = null
  } else {
    editErr.value = 'Incorrect password. Please try again.'
    editPwd.value = ''
  }
}

// ── Delete auth ───────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deletePwd         = ref('')
const deleteErr         = ref('')
const isDeleting        = ref(false)

const confirmDelete = async () => {
  if (deletePwd.value === ADMIN_PWD) {
    isDeleting.value = true
    try {
      await deleteDoc(doc(db, 'residents', detailFamily.value?.id))
      detailFamily.value      = null
      showDeleteConfirm.value = false
      deletePwd.value         = ''
    } catch (e) {
      console.error(e)
      deleteErr.value = 'Failed to delete from database.'
    } finally {
      isDeleting.value = false
    }
  } else {
    deleteErr.value = 'Incorrect password. Please try again.'
    deletePwd.value = ''
  }
}

// ── Camera ────────────────────────────────────────────────────────────────────
const videoRef    = ref(null)
const canvasRef   = ref(null)
const streaming   = ref(false)
const facingMode  = ref('user')
const cameraError = ref('')
const countdown   = ref(null)
let   streamObj   = null

const stopCamera = () => {
  if (streamObj) { streamObj.getTracks().forEach(t => t.stop()); streamObj = null }
  if (videoRef.value) videoRef.value.srcObject = null
  streaming.value = false
}
const startCamera = async (mode = facingMode.value) => {
  cameraError.value = ''
  stopCamera()
  try {
    streamObj = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:mode, width:{ideal:640}, height:{ideal:480} } })
    if (videoRef.value) { videoRef.value.srcObject = streamObj; await videoRef.value.play(); streaming.value = true }
  } catch(e) { cameraError.value = 'Camera access denied. Please allow camera permission or upload a photo instead.' }
}
const captureNow = () => {
  const canvas = canvasRef.value, video = videoRef.value
  if (!canvas||!video) return
  canvas.width  = video.videoWidth  || 640
  canvas.height = video.videoHeight || 480
  canvas.getContext('2d').drawImage(video, 0, 0)
  photo.value   = canvas.toDataURL('image/jpeg', 0.9)
  stopCamera()
}
const timedCapture = () => {
  let n = 3; countdown.value = n
  const t = setInterval(() => {
    n--
    if (n > 0) { countdown.value = n }
    else { clearInterval(t); countdown.value = null; captureNow() }
  }, 1000)
}
const switchCam = () => {
  facingMode.value = facingMode.value==='user' ? 'environment' : 'user'
  startCamera(facingMode.value)
}
const onFileUpload = (e) => {
  const file = e.target.files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { photo.value = ev.target.result }
  reader.readAsDataURL(file)
}

// ── Computed ──────────────────────────────────────────────────────────────────
const search   = ref('')
const filtered = computed(() =>
  localResidents.value.filter(r =>
    r.familyName && r.familyName.toLowerCase().includes(search.value.toLowerCase())
  )
)

const statBoxes = computed(() => [
  { icon: Users,         label:'Total Families',  value: localResidents.value.length,                                                              color:'#FFD23F' },
  { icon: Home,          label:'At Home',         value: localResidents.value.filter(r=>r.status==='At Home').length,                             color:'#00E5A0' },
  { icon: Footprints,    label:'Evacuated',       value: localResidents.value.filter(r=>r.status==='Evacuated').length,                           color:'#FFD23F' },
  { icon: AlertTriangle, label:'Vulnerable',      value: localResidents.value.filter(r=>r.vulnerableGroups&&r.vulnerableGroups.length>0).length,  color:'#FF3B5C' },
])

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusBadgeStyle = (s) => {
  const c = ({ 'At Home':'#00E5A0', Evacuated:'#FFD23F', Missing:'#FF3B5C', Relocated:'#00D4FF' })[s] || '#4A6080'
  return { background:`${c}18`, border:`1px solid ${c}44`, color:c }
}

const stepDotStyle = (n) => {
  if (step.value > n)  return 'background:#FFD23F;border-color:#FFD23F;color:#060A0F'
  if (step.value === n) return 'background:#FFD23F22;border-color:#FFD23F;color:#FFD23F'
  return 'background:#1A2535;border-color:#1A2535;color:#4A6080'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;600;700;800;900&display=swap');

@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.fade-up { animation:fadeUp .4s ease forwards }

/* ── Overlay & Modal ── */
.dc-overlay  { position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:'Outfit',sans-serif }
.dc-modal    { background:#0D1219;border:1px solid #FFD23F44;border-radius:12px;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;overflow-x:hidden }
.dc-auth-modal { background:#0D1219;border:2px solid #FFD23F44;border-radius:12px;width:100%;max-width:400px;padding:1.75rem;font-family:'Outfit',sans-serif }
.dc-modal-head { padding:1.25rem 1.5rem;border-bottom:1px solid #1A2535;display:flex;justify-content:space-between;align-items:center }
.dc-modal-body { padding:1.5rem }
.dc-modal-title { font-size:16px;font-weight:800;color:#FFD23F }
.dc-modal-sub   { font-size:12px;color:#4A6080;margin-top:2px }
.dc-modal-nav   { display:flex;justify-content:space-between;margin-top:24px }
.dc-icon-close  { background:#1A2535;border:none;color:#4A6080;width:28px;height:28px;border-radius:50%;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif }

/* ── Step bar ── */
.dc-stepbar    { display:flex;align-items:center;margin-bottom:24px }
.dc-step-item  { display:flex;align-items:center;gap:7px }
.dc-step-dot   { width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;transition:all .3s;border:2px solid #1A2535 }
.dc-step-lbl   { font-size:11px;white-space:nowrap;transition:color .2s }
.dc-step-line  { flex:1;height:1px;margin:0 8px;transition:background .3s }
.dc-step-title { font-size:14px;font-weight:700;color:#FFD23F;margin-bottom:16px }

/* ── Form fields ── */
.dc-field    { margin-bottom:14px }
.dc-label    { display:block;font-size:11px;color:#4A6080;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px }
.dc-input    { width:100%;background:#060A0F;border:1px solid #1A2535;border-radius:6px;padding:10px 12px;color:#E2EAF4;font-size:13px;outline:none;box-sizing:border-box;font-family:'Outfit',sans-serif;transition:border-color .2s }
.dc-textarea { width:100%;background:#060A0F;border:1px solid #1A2535;border-radius:6px;padding:10px 12px;color:#E2EAF4;font-size:13px;outline:none;resize:vertical;box-sizing:border-box;font-family:'Outfit',sans-serif;transition:border-color .2s }
.dc-toggle-row { display:flex;gap:8px;flex-wrap:wrap }
.dc-toggle   { padding:7px 16px;border-radius:6px;border:1px solid #1A2535;background:transparent;font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s }

/* ── Members ── */
.dc-members-head { display:flex;gap:8px;margin-bottom:8px;align-items:center }
.dc-member-row   { display:flex;gap:8px;margin-bottom:8px;align-items:center }
.dc-member-num   { width:28px;height:28px;border-radius:50%;background:#FFD23F18;border:1px solid #FFD23F33;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#FFD23F;flex-shrink:0 }
.dc-del-btn      { width:36px;height:36px;border-radius:6px;background:#FF3B5C18;border:1px solid #FF3B5C33;color:#FF3B5C;font-size:13px;cursor:pointer;flex-shrink:0 }
.dc-del-btn:disabled { opacity:.3;cursor:not-allowed }
.dc-add-member-btn { width:100%;padding:9px;border:1px dashed #1A2535;border-radius:6px;background:none;color:#4A6080;font-size:12px;cursor:pointer;margin-top:4px;font-family:'Outfit',sans-serif }

/* ── Needs ── */
.dc-needs-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px }
.dc-need-card  { padding:14px 16px;border:2px solid #1A2535;border-radius:8px;background:transparent;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .15s;font-family:'Outfit',sans-serif }
.dc-need-check { width:20px;height:20px;border-radius:4px;border:2px solid #4A6080;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:900;transition:all .2s }

/* ── Summary ── */
.dc-summary-box { padding:1rem;background:#060A0F;border:1px solid #1A2535;border-radius:8px;margin-top:16px }

/* ── Camera ── */
.dc-camera-notice { font-size:12px;color:#4A6080;line-height:1.7;padding:10px 14px;background:#FFD23F08;border:1px solid #FFD23F22;border-radius:8px;margin-bottom:16px }
.dc-viewfinder    { width:100%;max-width:400px;border-radius:12px;overflow:hidden;background:#000;border:2px solid #1A2535;aspect-ratio:4/3;position:relative;display:flex;align-items:center;justify-content:center;transition:border-color .3s }
.dc-upload-label  { display:flex;align-items:center;gap:8px;padding:9px 20px;border:1px dashed #1A2535;border-radius:8px;cursor:pointer;font-size:12px;color:#4A6080;width:100%;max-width:400px;justify-content:center;transition:border-color .2s;font-family:'Outfit',sans-serif }
.dc-upload-label:hover { border-color:#FFD23F }

/* ── Stat boxes ── */
.dc-stat      { background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:1.2rem;position:relative;overflow:hidden }
.dc-stat-glow { position:absolute;top:0;right:0;width:60px;height:60px;border-radius:0 8px 0 60px }

/* ── Family card ── */
.dc-family-card   { background:#0D1219;border:1px solid #1A2535;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:all .2s }
.dc-family-card:hover { border-color:#FFD23F55;transform:translateY(-2px) }
.dc-family-avatar { width:42px;height:42px;border-radius:10px;background:#FFD23F15;border:1px solid #FFD23F33;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0 }

/* ── Detail modal pieces ── */
.dc-info-grid   { display:grid;grid-template-columns:1fr 1fr;gap:10px }
.dc-info-cell   { background:#060A0F;border:1px solid #1A2535;border-radius:6px;padding:10px 14px }
.dc-member-detail { display:flex;align-items:center;gap:10px;padding:8px 12px;background:#060A0F;border:1px solid #1A2535;border-radius:6px;margin-bottom:6px }
.dc-divider     { height:1px;background:#1A2535;border:none;margin:1rem 0 }

/* ── Badges ── */
.dc-badge        { font-family:'DM Mono',monospace;font-size:10px;padding:2px 8px;border-radius:2px;display:inline-block;letter-spacing:.06em }
.dc-badge-yellow { background:#FFD23F18;border:1px solid #FFD23F44;color:#FFD23F }
.dc-badge-red    { background:#FF3B5C18;border:1px solid #FF3B5C44;color:#FF3B5C }
.dc-badge-muted  { background:#4A608018;border:1px solid #4A608044;color:#4A6080 }

/* ── Buttons ── */
.dc-btn-primary { background:#FFD23F;color:#060A0F;border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-primary:hover:not(:disabled) { opacity:.8 }
.dc-btn-primary:disabled { opacity:.4;cursor:not-allowed }
.dc-btn-primary.sm { font-size:11px;padding:6px 14px }
.dc-btn-green   { background:#00E5A0;color:#060A0F;border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-green:hover:not(:disabled) { opacity:.8 }
.dc-btn-green:disabled { opacity:.4;cursor:not-allowed }
.dc-btn-ghost   { background:transparent;border:1px solid #1A2535;color:#E2EAF4;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-ghost:hover { opacity:.8 }
.dc-btn-ghost.sm { font-size:12px;padding:7px 14px }
.dc-btn-outline { background:transparent;border:1px solid #FFD23F;color:#FFD23F;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-outline:hover { opacity:.8 }
.dc-btn-outline.sm { font-size:12px;padding:6px 14px }
.dc-btn-danger  { background:#FF3B5C;color:#fff;border:none;border-radius:6px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;font-family:'Outfit',sans-serif }
.dc-btn-danger:hover:not(:disabled) { opacity:.8 }
.dc-btn-danger:disabled { opacity:.4;cursor:not-allowed }
.dc-btn-danger.sm { font-size:12px;padding:6px 14px }

/* ── Spinner ── */
.dc-spinner { width:14px;height:14px;border:2px solid #06060F33;border-top:2px solid #060A0F;border-radius:50%;animation:dc-spin 0.8s linear infinite;display:inline-block }
@keyframes dc-spin { to { transform:rotate(360deg) } }
</style>