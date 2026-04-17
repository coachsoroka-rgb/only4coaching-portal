import { supabase } from '../lib/supabase.js'

export async function renderAdminShell(container, session) {
  container.innerHTML = `
    <div class="app-shell">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="logo"><span>ONLY</span>4COACHING</div>
          <div class="admin-badge">ADMIN</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:11px;color:var(--text-muted)">Coach Andriy Soroka</span>
          <button class="btn sm" id="signout-btn">Sign out</button>
        </div>
      </div>
      <div class="body-wrap">
        <aside class="sidebar" style="width:220px">
          <div class="search-wrap">
            <input type="text" id="client-search" placeholder="Search clients...">
          </div>
          <div class="client-list" id="client-list">
            <div class="loading" style="height:100px;font-size:10px">Loading...</div>
          </div>
        </aside>
        <main class="main" id="admin-main">
          <div class="loading">Loading dashboard...</div>
        </main>
      </div>
    </div>
  `

  document.getElementById('signout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut(); window.location.reload()
  })

  await loadClients()
  await renderOverview()
}

let allClients = []
let activeClientId = null

async function loadClients() {
  const { data } = await supabase.from('clients').select('*').order('first_name')
  allClients = data || []
  renderClientList(allClients)

  document.getElementById('client-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    renderClientList(allClients.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      (c.occupation||'').toLowerCase().includes(q) ||
      (c.email||'').toLowerCase().includes(q)
    ))
  })
}

function renderClientList(clients) {
  const el = document.getElementById('client-list')
  if (!clients.length) { el.innerHTML = '<div style="padding:1rem;font-size:11px;color:var(--text-muted);text-align:center">No clients found</div>'; return }
  el.innerHTML = clients.map(c => `
    <div class="client-row ${c.id === activeClientId ? 'active' : ''}" data-id="${c.id}">
      <div class="cr-name"><span class="cr-dot ${c.status||'new'}"></span>${c.first_name||''} ${c.last_name||''}</div>
      <div class="cr-sub">${c.occupation||c.email||''}</div>
    </div>`).join('')

  el.querySelectorAll('.client-row').forEach(row => {
    row.addEventListener('click', () => {
      activeClientId = row.dataset.id
      renderClientList(clients)
      const client = clients.find(c => c.id === activeClientId)
      if (client) renderClientDetail(client)
    })
  })
}

async function renderOverview() {
  const main = document.getElementById('admin-main')
  const { data: clients } = await supabase.from('clients').select('*')
  const total = clients?.length || 0
  const active = clients?.filter(c => c.status === 'active').length || 0
  const newClients = clients?.filter(c => c.status === 'new').length || 0

  main.innerHTML = `
    <div class="stats-row">
      <div class="stat-card"><div class="stat-label">Total Clients</div><div class="stat-value red">${total}</div><div class="stat-sub">All plans</div></div>
      <div class="stat-card"><div class="stat-label">Active</div><div class="stat-value">${active}</div><div class="stat-sub">Training now</div></div>
      <div class="stat-card"><div class="stat-label">New / Onboarding</div><div class="stat-value">${newClients}</div><div class="stat-sub">Awaiting setup</div></div>
      <div class="stat-card"><div class="stat-label">Portal</div><div class="stat-value" style="font-size:14px;margin-top:4px">LIVE</div><div class="stat-sub" style="color:var(--success)">✓ Connected</div></div>
    </div>
    <div class="section-title">All Clients</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr><th>Client</th><th>Status</th><th>Email</th><th>Weight</th><th>Portal Access</th></tr></thead>
        <tbody>${(clients||[]).map(c => `
          <tr data-id="${c.id}">
            <td><strong style="font-weight:600">${c.first_name||''} ${c.last_name||''}</strong><br><span style="font-size:10px;color:var(--text-muted)">${c.occupation||''}</span></td>
            <td><span class="pill ${c.status||'new'}">${c.status||'new'}</span></td>
            <td style="font-size:11px;color:var(--text-muted)">${c.email||''}</td>
            <td>${c.weight_kg ? c.weight_kg + ' kg' : '—'}</td>
            <td>${c.portal_access ? '<span style="color:var(--success);font-size:11px;font-weight:600">✓ Active</span>' : '<span style="color:#555;font-size:11px">✗ Pending</span>'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `

  main.querySelectorAll('.data-table tr[data-id]').forEach(row => {
    row.addEventListener('click', () => {
      activeClientId = row.dataset.id
      const client = allClients.find(c => c.id === activeClientId)
      if (client) { renderClientList(allClients); renderClientDetail(client) }
    })
  })
}

async function renderClientDetail(client) {
  const main = document.getElementById('admin-main')
  const initials = ((client.first_name?.[0]||'') + (client.last_name?.[0]||'')).toUpperCase() || '?'

  main.innerHTML = `
    <div class="back-link" id="back-link">← All clients</div>
    <div class="client-header">
      <div class="ch-left">
        <div class="avatar">${initials}</div>
        <div>
          <div class="ch-name">${client.first_name||''} ${client.last_name||''}</div>
          <div class="ch-meta">${client.email} · ${client.occupation||''}</div>
        </div>
      </div>
      <div class="ch-actions">
        <select id="status-select" class="btn" style="font-family:inherit;font-size:10px;letter-spacing:0.1em;cursor:pointer">
          <option value="new" ${client.status==='new'?'selected':''}>NEW</option>
          <option value="active" ${client.status==='active'?'selected':''}>ACTIVE</option>
          <option value="inactive" ${client.status==='inactive'?'selected':''}>INACTIVE</option>
        </select>
        <button class="btn primary" id="invite-btn">Send Portal Invite</button>
      </div>
    </div>
    <div class="tabs">
      <div class="tab active" data-tab="onboarding">Onboarding</div>
      <div class="tab" data-tab="inbody">InBody Data</div>
      <div class="tab" data-tab="documents">Documents</div>
      <div class="tab" data-tab="goals">Goals & Notes</div>
      <div class="tab" data-tab="messages">Messages</div>
    </div>
    <div id="tab-body"></div>
  `

  document.getElementById('back-link').addEventListener('click', () => {
    activeClientId = null; renderClientList(allClients); renderOverview()
  })

  document.getElementById('status-select').addEventListener('change', async (e) => {
    await supabase.from('clients').update({ status: e.target.value }).eq('id', client.id)
    client.status = e.target.value
    showToast('Status updated')
  })

  document.getElementById('invite-btn').addEventListener('click', async () => {
    const { error } = await supabase.auth.admin?.inviteUserByEmail?.(client.email) || {}
    showToast('Invite sent to ' + client.email)
  })

  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      loadAdminTab(tab.dataset.tab, client)
    })
  })

  loadAdminTab('onboarding', client)
}

async function loadAdminTab(tab, client) {
  const body = document.getElementById('tab-body')
  if (tab === 'onboarding') await renderAdminOnboarding(body, client)
  if (tab === 'inbody') await renderAdminInbody(body, client)
  if (tab === 'documents') await renderAdminDocuments(body, client)
  if (tab === 'goals') await renderAdminGoals(body, client)
  if (tab === 'messages') await renderAdminMessages(body, client)
}

async function renderAdminOnboarding(el, client) {
  const { data: ob } = await supabase.from('onboarding').select('*').eq('client_id', client.id).single()

  el.innerHTML = `
    <div class="card">
      <div class="section-title">Personal Info</div>
      <div class="ob-grid">
        <div class="ob-block"><div class="ob-label">Full Name</div><div class="ob-val">${client.first_name||''} ${client.last_name||''}</div></div>
        <div class="ob-block"><div class="ob-label">Email</div><div class="ob-val">${client.email||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Age / Weight / Height</div><div class="ob-val">${client.age||'—'}y · ${client.weight_kg||'—'}kg · ${client.height_cm||'—'}cm</div></div>
        <div class="ob-block"><div class="ob-label">Occupation</div><div class="ob-val">${client.occupation||'—'}</div></div>
      </div>
    </div>
    ${ob ? `
    <div class="card">
      <div class="section-title">Injuries & Medical</div>
      <div class="ob-grid">
        <div class="ob-block"><div class="ob-label">Injuries</div><div class="ob-val">${ob.injuries||'None reported'}</div></div>
        <div class="ob-block"><div class="ob-label">Medical Conditions</div><div class="ob-val">${ob.medical_conditions||'None'}</div></div>
        <div class="ob-block"><div class="ob-label">Medication</div><div class="ob-val">${ob.medication?'Yes':'No'}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Goals</div>
      <div class="ob-grid">
        <div class="ob-block"><div class="ob-label">Primary Goals</div><div class="ob-val">${ob.primary_goals||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Experience</div><div class="ob-val">${ob.training_experience||'—'}</div></div>
        <div class="ob-block" style="grid-column:1/-1"><div class="ob-label">In Their Own Words</div><div class="ob-val">${ob.goal_description||'—'}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-title">Lifestyle</div>
      <div class="ob-grid">
        <div class="ob-block"><div class="ob-label">Sleep</div><div class="ob-val">${ob.sleep_hours||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Stress</div><div class="ob-val">${ob.stress_level||'—'} / 5</div></div>
        <div class="ob-block"><div class="ob-label">Nutrition</div><div class="ob-val">${ob.nutrition_habits||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Alcohol</div><div class="ob-val">${ob.alcohol||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Training Frequency</div><div class="ob-val">${ob.training_frequency||'—'}</div></div>
        <div class="ob-block"><div class="ob-label">Notes</div><div class="ob-val">${ob.lifestyle_notes||'—'}</div></div>
      </div>
    </div>` : '<div class="card"><p style="font-size:13px;color:var(--text-muted)">No onboarding data yet. Client has not completed the onboarding form.</p></div>'}
  `
}

async function renderAdminInbody(el, client) {
  const { data: scans } = await supabase
    .from('inbody_scans').select('*').eq('client_id', client.id)
    .order('scan_date', { ascending: false })

  el.innerHTML = `
    <div class="card">
      <div class="section-title">Add New InBody Scan</div>
      <div class="field-row">
        <div class="field"><label>Scan Date</label><input type="date" id="ib_date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="field"><label>Body Weight (kg)</label><input type="number" id="ib_weight" placeholder="87.2" step="0.1"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Body Fat %</label><input type="number" id="ib_fat" placeholder="18.4" step="0.1"></div>
        <div class="field"><label>Skeletal Muscle (kg)</label><input type="number" id="ib_muscle" placeholder="38.6" step="0.1"></div>
        <div class="field"><label>Fat Mass (kg)</label><input type="number" id="ib_fatmass" placeholder="16.0" step="0.1"></div>
        <div class="field"><label>Visceral Fat Level</label><input type="number" id="ib_visceral" placeholder="4"></div>
        <div class="field"><label>BMR (kcal)</label><input type="number" id="ib_bmr" placeholder="1840"></div>
        <div class="field"><label>Body Water (L)</label><input type="number" id="ib_water" placeholder="42.1" step="0.1"></div>
      </div>
      <div class="field"><label>Coach Debrief Notes (shown to client)</label>
        <textarea id="ib_debrief" placeholder="Write your plain-language debrief for this client..."></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn primary" id="save-scan-btn">Save Scan →</button>
      </div>
    </div>
    ${scans?.length ? `
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Weight</th><th>Fat %</th><th>Muscle</th><th>Fat Mass</th><th>Debrief</th></tr></thead>
        <tbody>${scans.map(s=>`<tr>
          <td>${s.scan_date}</td><td>${s.body_weight_kg} kg</td>
          <td>${s.body_fat_percent}%</td><td>${s.skeletal_muscle_kg} kg</td>
          <td>${s.body_fat_mass_kg} kg</td>
          <td style="font-size:10px;color:${s.debrief_notes?'var(--success)':'#555'}">${s.debrief_notes?'✓ Written':'—'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>` : ''}
  `

  document.getElementById('save-scan-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-scan-btn')
    btn.textContent = 'Saving...'; btn.disabled = true
    const { error } = await supabase.from('inbody_scans').insert({
      client_id: client.id,
      scan_date: document.getElementById('ib_date').value,
      body_weight_kg: parseFloat(document.getElementById('ib_weight').value)||null,
      body_fat_percent: parseFloat(document.getElementById('ib_fat').value)||null,
      skeletal_muscle_kg: parseFloat(document.getElementById('ib_muscle').value)||null,
      body_fat_mass_kg: parseFloat(document.getElementById('ib_fatmass').value)||null,
      visceral_fat: parseInt(document.getElementById('ib_visceral').value)||null,
      bmr_kcal: parseInt(document.getElementById('ib_bmr').value)||null,
      body_water_l: parseFloat(document.getElementById('ib_water').value)||null,
      debrief_notes: document.getElementById('ib_debrief').value||null,
    })
    if (error) { showToast('Error: ' + error.message) }
    else { showToast('Scan saved'); await renderAdminInbody(el, client) }
    btn.textContent = 'Save Scan →'; btn.disabled = false
  })
}

async function renderAdminDocuments(el, client) {
  const { data: docs } = await supabase
    .from('documents').select('*').eq('client_id', client.id)
    .order('created_at', { ascending: false })

  el.innerHTML = `
    <div class="card">
      <div class="section-title">Upload Document</div>
      <div class="field-row">
        <div class="field"><label>Document Type</label>
          <select id="doc_type">
            <option value="nutrition">Nutrition Plan</option>
            <option value="training">Training Programme</option>
            <option value="goal_agreement">Goal Agreement</option>
            <option value="inbody">InBody PDF</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="field"><label>Label (shown to client)</label>
          <input id="doc_label" placeholder="e.g. Nutrition Plan — Phase 2">
        </div>
      </div>
      <div class="upload-zone" id="upload-zone">
        <input type="file" id="file-input" accept=".pdf">
        <div style="font-size:24px;margin-bottom:6px">📎</div>
        <div style="font-size:13px;font-weight:600">Click to select PDF</div>
        <p id="file-name-display">No file selected</p>
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn primary" id="upload-btn">Upload →</button>
      </div>
    </div>
    ${docs?.length ? `
    <div class="card">
      <div class="section-title">Client Documents</div>
      ${docs.map(d => `
        <div class="file-row">
          <div class="file-info">
            <span class="file-icon">📄</span>
            <div>
              <div class="file-name">${d.label}</div>
              <div class="file-date">${d.doc_type} · ${new Date(d.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
          </div>
          <div class="file-actions">
            ${d.file_url ? `<button class="btn sm" onclick="window.open('${d.file_url}','_blank')">View</button>` : ''}
            <button class="btn sm" data-delete="${d.id}">Delete</button>
          </div>
        </div>`).join('')}
    </div>` : ''}
  `

  document.getElementById('upload-zone').addEventListener('click', () => document.getElementById('file-input').click())
  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) document.getElementById('file-name-display').textContent = file.name
  })

  document.getElementById('upload-btn').addEventListener('click', async () => {
    const file = document.getElementById('file-input').files[0]
    const label = document.getElementById('doc_label').value || 'Document'
    const docType = document.getElementById('doc_type').value
    if (!file) { showToast('Please select a file'); return }

    const btn = document.getElementById('upload-btn')
    btn.textContent = 'Uploading...'; btn.disabled = true

    const path = `${client.id}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file)
    if (upErr) { showToast('Upload error: ' + upErr.message); btn.textContent = 'Upload →'; btn.disabled = false; return }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

    await supabase.from('documents').insert({
      client_id: client.id, doc_type: docType, label, file_path: path, file_url: publicUrl
    })

    showToast('Document uploaded')
    await renderAdminDocuments(el, client)
    btn.textContent = 'Upload →'; btn.disabled = false
  })

  el.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this document?')) return
      await supabase.from('documents').delete().eq('id', btn.dataset.delete)
      showToast('Document deleted')
      await renderAdminDocuments(el, client)
    })
  })
}

async function renderAdminGoals(el, client) {
  const { data: existing } = await supabase
    .from('goal_agreements').select('*').eq('client_id', client.id)
    .order('created_at', { ascending: false }).limit(1)

  const g = existing?.[0] || {}

  el.innerHTML = `
    <div class="card">
      <div class="section-title">Quarterly Goal Agreement</div>
      <div class="field-row">
        <div class="field"><label>Quarter</label><input id="g_quarter" value="${g.quarter||'Q2 2025 (Apr–Jun)'}"></div>
        <div class="field"><label>Status</label>
          <select id="g_status">
            <option value="draft" ${g.status==='draft'?'selected':''}>Draft</option>
            <option value="pending" ${g.status==='pending'?'selected':''}>Pending Signature</option>
            <option value="signed" ${g.status==='signed'?'selected':''}>Signed</option>
          </select>
        </div>
      </div>
      <div class="field"><label>Primary Goal</label><input id="g_goal" value="${g.primary_goal||''}"></div>
      <div class="field"><label>Strength Targets</label><input id="g_strength" value="${g.strength_targets||''}"></div>
      <div class="field"><label>Nutrition Commitment</label><input id="g_nutrition" value="${g.nutrition_commitment||''}"></div>
      <div class="field"><label>Sessions per Week</label><input id="g_sessions" value="${g.sessions_per_week||''}"></div>
      <div class="field"><label>Coach Commitment</label><input id="g_coach" value="${g.coach_commitment||'Monthly InBody + debrief · Programme updated every 6 weeks'}"></div>
      <div class="field"><label>Next Review Date</label><input type="date" id="g_review" value="${g.next_review||''}"></div>
      <div class="field"><label>Private Coach Notes (NOT shown to client)</label>
        <textarea id="g_private" placeholder="Internal observations, adjustments, concerns...">${g.private_notes||''}</textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn primary" id="save-goal-btn">Save Agreement →</button>
      </div>
    </div>
  `

  document.getElementById('save-goal-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-goal-btn')
    btn.textContent = 'Saving...'; btn.disabled = true

    const payload = {
      client_id: client.id,
      quarter: document.getElementById('g_quarter').value,
      status: document.getElementById('g_status').value,
      primary_goal: document.getElementById('g_goal').value,
      strength_targets: document.getElementById('g_strength').value,
      nutrition_commitment: document.getElementById('g_nutrition').value,
      sessions_per_week: document.getElementById('g_sessions').value,
      coach_commitment: document.getElementById('g_coach').value,
      next_review: document.getElementById('g_review').value || null,
      private_notes: document.getElementById('g_private').value,
    }

    if (g.id) {
      await supabase.from('goal_agreements').update(payload).eq('id', g.id)
    } else {
      await supabase.from('goal_agreements').insert(payload)
    }

    showToast('Goal agreement saved')
    btn.textContent = 'Save Agreement →'; btn.disabled = false
  })
}

async function renderAdminMessages(el, client) {
  const { data: msgs } = await supabase
    .from('messages').select('*').eq('client_id', client.id)
    .order('created_at', { ascending: true })

  el.innerHTML = `
    <div class="card">
      <div class="msg-thread" id="admin-thread">
        ${msgs?.length ? msgs.map(m => `
          <div class="msg ${m.sender}">
            <div class="msg-sender">${m.sender === 'coach' ? 'You (Coach)' : client.first_name||'Client'} · ${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
            ${m.content}
          </div>`).join('') : '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:1rem">No messages yet.</div>'}
      </div>
      <div class="msg-input-row">
        <input type="text" id="admin-msg-input" placeholder="Write to ${client.first_name||'client'}...">
        <button class="btn primary" id="admin-send-btn">Send</button>
      </div>
    </div>
  `

  const thread = document.getElementById('admin-thread')
  thread.scrollTop = thread.scrollHeight

  async function send() {
    const input = document.getElementById('admin-msg-input')
    const val = input.value.trim(); if (!val) return
    input.value = ''
    await supabase.from('messages').insert({ client_id: client.id, sender: 'coach', content: val })
    const div = document.createElement('div'); div.className = 'msg coach'
    div.innerHTML = `<div class="msg-sender">You (Coach) · now</div>${val}`
    thread.appendChild(div); thread.scrollTop = thread.scrollHeight
  }

  document.getElementById('admin-send-btn').addEventListener('click', send)
  document.getElementById('admin-msg-input').addEventListener('keydown', e => { if (e.key === 'Enter') send() })
}

function showToast(msg) { window.showToast?.(msg) }
