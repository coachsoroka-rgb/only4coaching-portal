import { supabase } from '../lib/supabase.js'

export function renderOnboarding(container) {
  let step = 1
  const data = {}

  const steps = [
    'Personal info', 'Injuries', 'Goals', 'Lifestyle', 'Confirm'
  ]

  function render() {
    container.innerHTML = `
      <div style="max-width:640px;margin:0 auto;padding:2rem 1rem 4rem">
        <div style="text-align:center;margin-bottom:2rem">
          <div class="login-wordmark"><span>ONLY</span>4COACHING</div>
          <div class="login-divider"></div>
          <div class="login-tagline">New Client Onboarding</div>
        </div>
        <div style="margin-bottom:1.5rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            ${steps.map((s,i) => `<span style="font-size:10px;font-weight:600;letter-spacing:0.1em;color:${i < step-1 ? 'var(--red)' : i === step-1 ? 'var(--text)' : '#444'}">${s.toUpperCase()}</span>`).join('')}
          </div>
          <div style="height:2px;background:var(--grey-light)">
            <div style="height:100%;background:var(--red);width:${(step/5)*100}%;transition:width 0.4s"></div>
          </div>
        </div>
        ${renderStep()}
      </div>
    `
    bindStep()
  }

  function renderStep() {
    if (step === 1) return `
      <div class="card card-red">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;color:var(--red);margin-bottom:10px">STEP 1 OF 5</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Personal information</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:1.5rem">Tell us about yourself so we can personalise your programme.</div>
        <div class="field-row">
          <div class="field"><label>First name</label><input id="f_fname" value="${data.fname||''}" placeholder="Thomas"></div>
          <div class="field"><label>Last name</label><input id="f_lname" value="${data.lname||''}" placeholder="Martin"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Age</label><input id="f_age" type="number" value="${data.age||''}" placeholder="38"></div>
          <div class="field"><label>Occupation</label><input id="f_occ" value="${data.occ||''}" placeholder="EU Policy Advisor"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Current weight (kg)</label><input id="f_weight" type="number" value="${data.weight||''}" placeholder="85"></div>
          <div class="field"><label>Height (cm)</label><input id="f_height" type="number" value="${data.height||''}" placeholder="180"></div>
        </div>
        <div class="field"><label>Email address</label><input id="f_email" type="email" value="${data.email||''}" placeholder="your@email.com"></div>
        <div style="display:flex;justify-content:flex-end;margin-top:1rem">
          <button class="btn primary" id="next-btn">Continue →</button>
        </div>
      </div>`

    if (step === 2) return `
      <div class="card card-red">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;color:var(--red);margin-bottom:10px">STEP 2 OF 5</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Injuries & medical history</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:1.5rem">Everything stays between you and your coach.</div>
        <div class="field">
          <label>Current injuries or physical limitations</label>
          <div class="pill-select" data-key="injuries">
            ${['Lower back','Knee','Shoulder','Hip','Elbow / wrist','Neck','None currently'].map(o =>
              `<span class="sel-pill ${(data.injuries||[]).includes(o)?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field"><label>Describe injuries or past surgeries (optional)</label>
          <textarea id="f_injdetail" placeholder="e.g. Right knee meniscus 2021, fully recovered...">${data.injdetail||''}</textarea>
        </div>
        <div class="field">
          <label>Medical conditions</label>
          <div class="pill-select" data-key="medical">
            ${['High blood pressure','Heart condition','Diabetes','Asthma','None'].map(o =>
              `<span class="sel-pill ${(data.medical||[]).includes(o)?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Taking medication that may affect training?</label>
          <div class="pill-select" data-key="medication" data-single="true">
            ${['Yes','No'].map(o =>
              `<span class="sel-pill ${data.medication===o?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <button class="btn primary" id="next-btn">Continue →</button>
        </div>
      </div>`

    if (step === 3) return `
      <div class="card card-red">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;color:var(--red);margin-bottom:10px">STEP 3 OF 5</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Your goals</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:1.5rem">Select everything that applies — we build around your priorities.</div>
        <div class="field">
          <label>Primary goals</label>
          <div class="pill-select" data-key="goals">
            ${['Lose body fat','Build muscle mass','Get stronger','Improve posture','Athletic performance','Move pain-free','General health','Mental wellbeing'].map(o =>
              `<span class="sel-pill ${(data.goals||[]).includes(o)?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Training experience</label>
          <div class="pill-select" data-key="experience" data-single="true">
            ${['Complete beginner','Some experience (1–2 yrs)','Intermediate (2–5 yrs)','Advanced (5+ yrs)'].map(o =>
              `<span class="sel-pill ${data.experience===o?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field"><label>What does success look like in 3 months?</label>
          <textarea id="f_goaltext" placeholder="e.g. I want to deadlift my bodyweight, lose 5kg of fat...">${data.goaltext||''}</textarea>
        </div>
        <div class="field"><label>Target body weight (kg) — optional</label>
          <input id="f_targetw" type="number" value="${data.targetw||''}" placeholder="e.g. 80">
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <button class="btn primary" id="next-btn">Continue →</button>
        </div>
      </div>`

    if (step === 4) return `
      <div class="card card-red">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;color:var(--red);margin-bottom:10px">STEP 4 OF 5</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Lifestyle & habits</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:1.5rem">Training is 1 hour. The other 23 hours matter just as much.</div>
        <div class="field">
          <label>Average sleep per night</label>
          <div class="pill-select" data-key="sleep" data-single="true">
            ${['Less than 6h','6–7h','7–8h','8h+'].map(o =>
              `<span class="sel-pill ${data.sleep===o?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Daily stress level at work (1 = low, 5 = very high)</label>
          <div class="pill-select" data-key="stress" data-single="true" style="gap:6px">
            ${['1','2','3','4','5'].map(o =>
              `<span class="sel-pill ${data.stress===o?'sel-active':''}" data-val="${o}" style="width:42px;text-align:center">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Current nutrition habits</label>
          <div class="pill-select" data-key="nutrition" data-single="true">
            ${['No structure','Some awareness','Tracking calories','Following a plan','Very disciplined'].map(o =>
              `<span class="sel-pill ${data.nutrition===o?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Alcohol consumption</label>
          <div class="pill-select" data-key="alcohol" data-single="true">
            ${['None','Occasional (1–2/week)','Regular (3–5/week)','Daily'].map(o =>
              `<span class="sel-pill ${data.alcohol===o?'sel-active':''}" data-val="${o}">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field">
          <label>Sessions per week (realistic commitment)</label>
          <div class="pill-select" data-key="frequency" data-single="true" style="gap:6px">
            ${['1x','2x','3x','4x','5x+'].map(o =>
              `<span class="sel-pill ${data.frequency===o?'sel-active':''}" data-val="${o}" style="width:50px;text-align:center">${o}</span>`
            ).join('')}
          </div>
        </div>
        <div class="field"><label>Anything else your coach should know?</label>
          <textarea id="f_lifestyle" placeholder="e.g. I travel for work 1–2 weeks per month. Early mornings work best.">${data.lifestyle||''}</textarea>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <button class="btn primary" id="next-btn">Review →</button>
        </div>
      </div>`

    if (step === 5) return `
      <div class="card card-red">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;color:var(--red);margin-bottom:10px">STEP 5 OF 5</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:6px">Review & submit</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:1.5rem">Your coach will review this before your first session.</div>
        <div class="ob-grid" style="margin-bottom:1rem">
          <div class="ob-block"><div class="ob-label">Name</div><div class="ob-val">${data.fname||''} ${data.lname||''}</div></div>
          <div class="ob-block"><div class="ob-label">Email</div><div class="ob-val">${data.email||'—'}</div></div>
          <div class="ob-block"><div class="ob-label">Age / Weight / Height</div><div class="ob-val">${data.age||'—'}y · ${data.weight||'—'}kg · ${data.height||'—'}cm</div></div>
          <div class="ob-block"><div class="ob-label">Goals</div><div class="ob-val">${(data.goals||[]).join(', ')||'—'}</div></div>
          <div class="ob-block"><div class="ob-label">Injuries</div><div class="ob-val">${(data.injuries||[]).join(', ')||'—'}</div></div>
          <div class="ob-block"><div class="ob-label">Sleep / Stress</div><div class="ob-val">${data.sleep||'—'} · ${data.stress||'—'}/5</div></div>
        </div>
        <div class="field"><label>Final notes to your coach (optional)</label>
          <textarea id="f_finalnotes" placeholder="Anything else Andriy should know before you meet?">${data.finalnotes||''}</textarea>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;margin:1rem 0;padding:12px;background:var(--grey-mid)">
          <input type="checkbox" id="f_consent" ${data.consent?'checked':''} style="margin-top:2px;accent-color:var(--red);width:16px;height:16px;flex-shrink:0">
          <label for="f_consent" style="font-size:11px;color:var(--text-muted);line-height:1.6;cursor:pointer">I confirm the information provided is accurate and I agree to the ONLY4COACHING training guidelines and data privacy policy.</label>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <button class="btn primary" id="submit-btn">Submit onboarding →</button>
        </div>
        <div id="submit-error" style="font-size:11px;color:var(--red);margin-top:8px;text-align:center"></div>
      </div>`
  }

  function saveStep() {
    if (step === 1) {
      data.fname = document.getElementById('f_fname')?.value
      data.lname = document.getElementById('f_lname')?.value
      data.age = document.getElementById('f_age')?.value
      data.occ = document.getElementById('f_occ')?.value
      data.weight = document.getElementById('f_weight')?.value
      data.height = document.getElementById('f_height')?.value
      data.email = document.getElementById('f_email')?.value
    }
    if (step === 2) {
      data.injdetail = document.getElementById('f_injdetail')?.value
    }
    if (step === 3) {
      data.goaltext = document.getElementById('f_goaltext')?.value
      data.targetw = document.getElementById('f_targetw')?.value
    }
    if (step === 4) {
      data.lifestyle = document.getElementById('f_lifestyle')?.value
    }
    if (step === 5) {
      data.finalnotes = document.getElementById('f_finalnotes')?.value
      data.consent = document.getElementById('f_consent')?.checked
    }
    // Save pill selections
    document.querySelectorAll('.pill-select').forEach(ps => {
      const key = ps.dataset.key
      const single = ps.dataset.single === 'true'
      const active = [...ps.querySelectorAll('.sel-active')].map(el => el.dataset.val)
      data[key] = single ? (active[0] || null) : active
    })
  }

  function bindStep() {
    // Pill toggle
    document.querySelectorAll('.sel-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const ps = pill.closest('.pill-select')
        const single = ps.dataset.single === 'true'
        if (single) ps.querySelectorAll('.sel-pill').forEach(p => p.classList.remove('sel-active'))
        pill.classList.toggle('sel-active')
      })
    })

    document.getElementById('next-btn')?.addEventListener('click', () => {
      saveStep()
      step++; render()
      window.scrollTo({top:0,behavior:'smooth'})
    })

    document.getElementById('back-btn')?.addEventListener('click', () => {
      saveStep()
      step--; render()
      window.scrollTo({top:0,behavior:'smooth'})
    })

    document.getElementById('submit-btn')?.addEventListener('click', async () => {
      saveStep()
      if (!data.consent) { document.getElementById('submit-error').textContent = 'Please confirm the consent checkbox.'; return }
      if (!data.email) { document.getElementById('submit-error').textContent = 'Email is required.'; return }

      const submitBtn = document.getElementById('submit-btn')
      submitBtn.textContent = 'Submitting...'
      submitBtn.disabled = true

      try {
        // Upsert client
        const { data: client, error: cErr } = await supabase
          .from('clients')
          .upsert({ email: data.email, first_name: data.fname, last_name: data.lname, age: parseInt(data.age), weight_kg: parseFloat(data.weight), height_cm: parseFloat(data.height), occupation: data.occ, status: 'new' }, { onConflict: 'email' })
          .select().single()

        if (cErr) throw cErr

        // Insert onboarding
        await supabase.from('onboarding').insert({
          client_id: client.id,
          injuries: (data.injuries||[]).join(', '),
          medical_conditions: (data.medical||[]).join(', '),
          medication: data.medication === 'Yes',
          primary_goals: (data.goals||[]).join(', '),
          training_experience: data.experience,
          goal_description: data.goaltext,
          target_weight_kg: parseFloat(data.targetw)||null,
          sleep_hours: data.sleep,
          stress_level: parseInt(data.stress)||null,
          nutrition_habits: data.nutrition,
          alcohol: data.alcohol,
          training_frequency: data.frequency,
          lifestyle_notes: data.lifestyle + (data.finalnotes ? '\n\nFinal notes: ' + data.finalnotes : ''),
          consent: data.consent
        })

        // Show success
        container.innerHTML = `
          <div style="max-width:480px;margin:4rem auto;padding:0 1.5rem;text-align:center">
            <div class="login-wordmark" style="margin-bottom:2rem"><span>ONLY</span>4COACHING</div>
            <div style="width:56px;height:56px;border-radius:50%;border:2px solid var(--red);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style="font-size:20px;font-weight:700;margin-bottom:10px">You're all set, ${data.fname}.</div>
            <p style="font-size:13px;color:var(--text-muted);line-height:1.8;margin-bottom:2rem">Coach Andriy will review your profile and send your portal access link within 24 hours.</p>
            <div style="background:var(--grey);padding:1.25rem;text-align:left">
              <div style="font-size:9px;font-weight:700;letter-spacing:0.18em;color:#555;margin-bottom:10px;text-transform:uppercase">What happens next</div>
              <div style="font-size:12px;color:var(--text-muted);line-height:2.2">1. Coach reviews your profile<br>2. Your portal access goes live<br>3. First session — let's get to work.</div>
            </div>
          </div>`
      } catch (err) {
        document.getElementById('submit-error').textContent = 'Error: ' + err.message
        submitBtn.textContent = 'Submit onboarding →'
        submitBtn.disabled = false
      }
    })
  }

  // Pill styles
  const style = document.createElement('style')
  style.textContent = `
    .pill-select { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
    .sel-pill { font-size:12px; font-weight:500; padding:7px 14px; border:1px solid var(--grey-light); cursor:pointer; color:var(--text-muted); background:var(--grey-mid); transition:all 0.15s; user-select:none; }
    .sel-pill:hover { border-color:var(--red); color:var(--red); }
    .sel-pill.sel-active { background:var(--red); border-color:var(--red); color:#fff; }
  `
  document.head.appendChild(style)
  render()
}
