import { supabase } from '../lib/supabase.js'

export async function renderClientShell(container, session) {
  const email = session.user.email

  // Fetch client record
  const { data: client } = await supabase
    .from('clients').select('*').eq('email', email).single()

  if (!client) {
    container.innerHTML = `<div class="loading">Profile not found. Contact your coach.</div>`
    return
  }

  const initials = ((client.first_name?.[0]||'') + (client.last_name?.[0]||'')).toUpperCase() || email[0].toUpperCase()

  container.innerHTML = `
    <div class="app-shell">
      <div class="topbar">
        <div class="logo"><span>ONLY</span>4COACHING</div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;color:var(--text-muted)">${client.first_name||''} ${client.last_name||''}</span>
          <div class="avatar" style="cursor:pointer" title="Sign out" id="signout-btn">${initials}</div>
        </div>
      </div>
      <div class="body-wrap">
        <aside class="sidebar">
          <div class="nav-section">
            <div class="nav-label">Overview</div>
            <div class="nav-item active" data-page="dashboard"><span class="nav-icon">◈</span>Dashboard</div>
          </div>
          <div class="nav-section">
            <div class="nav-label">My Programme</div>
            <div class="nav-item" data-page="nutrition"><span class="nav-icon">▤</span>Nutrition Plan</div>
            <div class="nav-item" data-page="inbody"><span class="nav-icon">◉</span>Body Composition</div>
            <div class="nav-item" data-page="debrief"><span class="nav-icon">▦</span>InBody Debrief</div>
          </div>
          <div class="nav-section">
            <div class="nav-label">Goals</div>
            <div class="nav-item" data-page="goals"><span class="nav-icon">◎</span>Goal Agreement</div>
          </div>
          <div class="nav-section">
            <div class="nav-label">Support</div>
            <div class="nav-item" data-page="messages"><span class="nav-icon">✉</span>Messages</div>
            <div class="nav-item" data-page="faq"><span class="nav-icon">?</span>FAQ</div>
          </div>
        </aside>
        <main class="main" id="client-main">
          <div class="loading">Loading your portal...</div>
        </main>
      </div>
    </div>
  `

  // Nav clicks
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
      item.classList.add('active')
      loadPage(item.dataset.page, client)
    })
  })

  document.getElementById('signout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.reload()
  })

  loadPage('dashboard', client)
}

async function loadPage(page, client) {
  const main = document.getElementById('client-main')
  main.innerHTML = '<div class="loading">Loading...</div>'

  if (page === 'dashboard') await renderDashboard(main, client)
  if (page === 'nutrition') await renderNutrition(main, client)
  if (page === 'inbody') await renderInbody(main, client)
  if (page === 'debrief') await renderDebrief(main, client)
  if (page === 'goals') await renderGoals(main, client)
  if (page === 'messages') await renderMessages(main, client)
  if (page === 'faq') renderFaq(main)
}

async function renderDashboard(main, client) {
  const [{ data: scans }, { data: docs }, { data: goals }] = await Promise.all([
    supabase.from('inbody_scans').select('*').eq('client_id', client.id).order('scan_date', { ascending: false }).limit(2),
    supabase.from('documents').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('goal_agreements').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(1)
  ])

  const latest = scans?.[0]
  const prev = scans?.[1]

  const fatDiff = latest && prev ? (latest.body_fat_percent - prev.body_fat_percent).toFixed(1) : null
  const muscleDiff = latest && prev ? (latest.skeletal_muscle_kg - prev.skeletal_muscle_kg).toFixed(1) : null

  main.innerHTML = `
    <div class="welcome-banner">
      <div>
        <div class="wb-title">Welcome back, <em>${client.first_name||''}.</em></div>
        <div class="wb-sub">Your personal coaching portal.</div>
      </div>
    </div>

    ${latest ? `
    <div class="stats-row" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card"><div class="stat-label">Body Fat</div><div class="stat-value">${latest.body_fat_percent}<span style="font-size:14px">%</span></div><div class="stat-sub">${fatDiff ? (fatDiff > 0 ? '↑' : '↓') + ' ' + Math.abs(fatDiff) + '% vs last scan' : 'First scan'}</div></div>
      <div class="stat-card"><div class="stat-label">Lean Mass</div><div class="stat-value">${latest.skeletal_muscle_kg}<span style="font-size:14px"> kg</span></div><div class="stat-sub">${muscleDiff ? (muscleDiff > 0 ? '↑' : '↓') + ' ' + Math.abs(muscleDiff) + ' kg vs last scan' : 'First scan'}</div></div>
      <div class="stat-card"><div class="stat-label">Body Weight</div><div class="stat-value red">${latest.body_weight_kg}<span style="font-size:14px"> kg</span></div><div class="stat-sub">Last measured ${latest.scan_date}</div></div>
    </div>` : ''}

    ${docs?.length ? `
    <div class="section-title">Recent Documents</div>
    <div class="doc-grid">
      ${docs.map(d => `
        <div class="doc-card" onclick="window.open('${d.file_url}','_blank')">
          <div class="doc-card-icon">📄</div>
          <div class="doc-card-name">${d.label}</div>
          <div class="doc-card-meta">${new Date(d.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          <div class="doc-tag pdf">PDF</div>
        </div>`).join('')}
    </div>` : ''}

    ${goals?.[0] ? `
    <div class="section-title">Current Goal</div>
    <div class="card" style="border-left:2px solid var(--red)">
      <div style="font-size:13px;font-weight:700;margin-bottom:6px">${goals[0].quarter}</div>
      <div style="font-size:12px;color:var(--text-muted);line-height:1.7">${goals[0].primary_goal}</div>
    </div>` : ''}
  `
}

async function renderNutrition(main, client) {
  const { data: docs } = await supabase
    .from('documents').select('*')
    .eq('client_id', client.id).eq('doc_type', 'nutrition')
    .order('created_at', { ascending: false })

  main.innerHTML = `
    <div class="section-title">Nutrition Plans</div>
    ${docs?.length ? `
      <div class="doc-grid">
        ${docs.map(d => `
          <div class="doc-card" onclick="window.open('${d.file_url}','_blank')">
            <div class="doc-card-icon">📄</div>
            <div class="doc-card-name">${d.label}</div>
            <div class="doc-card-meta">${new Date(d.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <div class="doc-tag pdf">PDF — Click to open</div>
          </div>`).join('')}
      </div>` : '<div class="card"><p style="font-size:13px;color:var(--text-muted)">Your nutrition plan will appear here once your coach uploads it.</p></div>'}
  `
}

async function renderInbody(main, client) {
  const { data: scans } = await supabase
    .from('inbody_scans').select('*').eq('client_id', client.id)
    .order('scan_date', { ascending: false })

  if (!scans?.length) {
    main.innerHTML = `<div class="section-title">Body Composition</div><div class="card"><p style="font-size:13px;color:var(--text-muted)">Your InBody data will appear here after your first scan.</p></div>`
    return
  }

  const latest = scans[0]
  const prev = scans[1]

  main.innerHTML = `
    <div class="section-title">Body Composition — InBody History</div>
    <div style="display:flex;gap:8px;margin-bottom:1.25rem;flex-wrap:wrap">
      ${scans.map((s,i) => `<span style="font-size:10px;font-weight:700;letter-spacing:0.12em;padding:5px 14px;cursor:pointer;${i===0?'background:var(--red);color:#fff':'border:1px solid var(--grey-light);color:var(--text-muted)'}">${s.scan_date}</span>`).join('')}
    </div>
    <div class="ib-grid">
      <div class="ib-card"><div class="ib-label">Body Weight</div><div class="ib-val">${latest.body_weight_kg} kg</div>${prev?`<div class="ib-change ${latest.body_weight_kg < prev.body_weight_kg?'pos':'neg'}">${latest.body_weight_kg < prev.body_weight_kg?'▼':'▲'} ${Math.abs(latest.body_weight_kg-prev.body_weight_kg).toFixed(1)} kg vs prev</div>`:''}</div>
      <div class="ib-card"><div class="ib-label">Body Fat %</div><div class="ib-val">${latest.body_fat_percent}%</div>${prev?`<div class="ib-change ${latest.body_fat_percent < prev.body_fat_percent?'pos':'neg'}">${latest.body_fat_percent < prev.body_fat_percent?'▼':'▲'} ${Math.abs(latest.body_fat_percent-prev.body_fat_percent).toFixed(1)}% vs prev</div>`:''}</div>
      <div class="ib-card"><div class="ib-label">Skeletal Muscle</div><div class="ib-val">${latest.skeletal_muscle_kg} kg</div>${prev?`<div class="ib-change ${latest.skeletal_muscle_kg > prev.skeletal_muscle_kg?'pos':'neg'}">${latest.skeletal_muscle_kg > prev.skeletal_muscle_kg?'▲':'▼'} ${Math.abs(latest.skeletal_muscle_kg-prev.skeletal_muscle_kg).toFixed(1)} kg vs prev</div>`:''}</div>
      <div class="ib-card"><div class="ib-label">Fat Mass</div><div class="ib-val">${latest.body_fat_mass_kg} kg</div>${prev?`<div class="ib-change ${latest.body_fat_mass_kg < prev.body_fat_mass_kg?'pos':'neg'}">${latest.body_fat_mass_kg < prev.body_fat_mass_kg?'▼':'▲'} ${Math.abs(latest.body_fat_mass_kg-prev.body_fat_mass_kg).toFixed(1)} kg vs prev</div>`:''}</div>
      ${latest.visceral_fat?`<div class="ib-card"><div class="ib-label">Visceral Fat</div><div class="ib-val">${latest.visceral_fat}</div></div>`:''}
      ${latest.bmr_kcal?`<div class="ib-card"><div class="ib-label">BMR</div><div class="ib-val">${latest.bmr_kcal} kcal</div></div>`:''}
    </div>
    <div class="section-title">All Scans</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Weight</th><th>Fat %</th><th>Muscle</th><th>Fat mass</th></tr></thead>
        <tbody>${scans.map(s=>`<tr><td>${s.scan_date}</td><td>${s.body_weight_kg} kg</td><td>${s.body_fat_percent}%</td><td>${s.skeletal_muscle_kg} kg</td><td>${s.body_fat_mass_kg} kg</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `
}

async function renderDebrief(main, client) {
  const { data: scans } = await supabase
    .from('inbody_scans').select('*').eq('client_id', client.id)
    .not('debrief_notes', 'is', null)
    .order('scan_date', { ascending: false })

  main.innerHTML = `
    <div class="section-title">InBody Debrief — Coach Notes</div>
    ${scans?.length ? scans.map(s => `
      <div class="debrief-block">
        <div class="db-date">${s.scan_date}</div>
        <div class="db-text">${s.debrief_notes}</div>
      </div>`).join('') : '<div class="card"><p style="font-size:13px;color:var(--text-muted)">Debrief notes will appear here after each InBody scan.</p></div>'}
  `
}

async function renderGoals(main, client) {
  const { data: agreements } = await supabase
    .from('goal_agreements').select('*').eq('client_id', client.id)
    .order('created_at', { ascending: false })

  main.innerHTML = `
    <div class="section-title">Quarterly Goal Agreements</div>
    ${agreements?.length ? agreements.map(a => `
      <div class="card" style="border-left:2px solid var(--red);margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:10px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:14px;font-weight:700;margin-bottom:2px">${a.quarter}</div>
            <div style="font-size:11px;color:var(--text-muted)">${new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <span class="pill ${a.status}">${a.status}</span>
        </div>
        ${a.primary_goal?`<div class="ob-block" style="margin-bottom:8px"><div class="ob-label">Primary Goal</div><div class="ob-val">${a.primary_goal}</div></div>`:''}
        ${a.strength_targets?`<div class="ob-block" style="margin-bottom:8px"><div class="ob-label">Strength Targets</div><div class="ob-val">${a.strength_targets}</div></div>`:''}
        ${a.nutrition_commitment?`<div class="ob-block" style="margin-bottom:8px"><div class="ob-label">Nutrition</div><div class="ob-val">${a.nutrition_commitment}</div></div>`:''}
        ${a.sessions_per_week?`<div class="ob-block" style="margin-bottom:8px"><div class="ob-label">Sessions / Week</div><div class="ob-val">${a.sessions_per_week}</div></div>`:''}
        ${a.next_review?`<div class="ob-block"><div class="ob-label">Next Review</div><div class="ob-val">${a.next_review}</div></div>`:''}
      </div>`).join('') : '<div class="card"><p style="font-size:13px;color:var(--text-muted)">Your quarterly goal agreement will appear here once set with your coach.</p></div>'}
  `
}

async function renderMessages(main, client) {
  const { data: msgs } = await supabase
    .from('messages').select('*').eq('client_id', client.id)
    .order('created_at', { ascending: true })

  main.innerHTML = `
    <div class="section-title">Messages — Coach Andriy</div>
    <div class="card">
      <div class="msg-thread" id="msg-thread">
        ${msgs?.length ? msgs.map(m => `
          <div class="msg ${m.sender}">
            <div class="msg-sender">${m.sender === 'coach' ? 'Coach Andriy' : 'You'} · ${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
            ${m.content}
          </div>`).join('') : '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:1rem">No messages yet. Send your coach a message below.</div>'}
      </div>
      <div class="msg-input-row">
        <input type="text" id="msg-input" placeholder="Write to Coach Andriy...">
        <button class="btn primary" id="send-btn">Send</button>
      </div>
    </div>
  `

  const sendBtn = document.getElementById('send-btn')
  const input = document.getElementById('msg-input')

  async function send() {
    const val = input.value.trim()
    if (!val) return
    input.value = ''
    await supabase.from('messages').insert({ client_id: client.id, sender: 'client', content: val })
    const thread = document.getElementById('msg-thread')
    const div = document.createElement('div')
    div.className = 'msg client'
    div.innerHTML = `<div class="msg-sender">You · now</div>${val}`
    thread.appendChild(div)
    thread.scrollTop = thread.scrollHeight
  }

  sendBtn.addEventListener('click', send)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send() })

  const thread = document.getElementById('msg-thread')
  thread.scrollTop = thread.scrollHeight
}

function renderFaq(main) {
  const faqs = [
    { q: 'How often will I have an InBody scan?', a: 'Every 6–8 weeks, aligned with your programme blocks. Your coach schedules this at the studio. You will always receive a written debrief within 48 hours of your scan.' },
    { q: 'What happens if I miss a session?', a: 'Contact your coach as early as possible. Sessions can be rescheduled within the same week subject to availability. Consistent attendance is the single biggest factor in your results.' },
    { q: 'How is my nutrition plan updated?', a: 'Your plan is reviewed after every InBody scan and at each quarterly goal review. Your coach uploads the new PDF directly to your portal and will message you when it is live.' },
    { q: 'What are the Four Pillars?', a: 'Squat, Deadlift, Push, and Pull. These are the four fundamental movement patterns your entire programme is built around. Every session reinforces one or more of these patterns with progressive overload.' },
    { q: 'Can I train on days without a session?', a: 'Yes — your coach can provide accessory work or mobility recommendations for your independent days. Ask via the messages tab.' },
    { q: 'How do I read my InBody results?', a: 'Your InBody debrief section explains every scan in plain language. Your coach translates the numbers into clear next steps — you do not need to interpret the raw data yourself.' },
  ]

  main.innerHTML = `
    <div class="section-title">FAQ — Frequently Asked Questions</div>
    ${faqs.map((f, i) => `
      <div class="faq-item">
        <div class="faq-q" onclick="this.nextElementSibling.classList.toggle('open');this.querySelector('.faq-arrow').classList.toggle('open')">
          <span>${f.q}</span><span class="faq-arrow">▼</span>
        </div>
        <div class="faq-a">${f.a}</div>
      </div>`).join('')}
  `
}
