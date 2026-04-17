import { supabase } from '../lib/supabase.js'

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-bg"></div>
      <div class="login-box">
        <div class="login-logo">
          <div class="login-wordmark"><span>ONLY</span>4COACHING</div>
          <div class="login-divider"></div>
          <div class="login-tagline">Client Portal — Brussels</div>
        </div>
        <div class="login-card">
          <h2>Access Your Portal</h2>
          <p>Enter your email address. We'll send you a secure login link — no password needed.</p>
          <div class="field">
            <label>Email Address</label>
            <input type="email" id="login-email" placeholder="your@email.com" autocomplete="email">
          </div>
          <button class="btn primary" id="login-btn" style="width:100%;margin-top:4px">Send Login Link →</button>
          <div class="login-error" id="login-msg"></div>
        </div>
      </div>
    </div>
  `

  const btn = document.getElementById('login-btn')
  const input = document.getElementById('login-email')
  const msg = document.getElementById('login-msg')

  btn.addEventListener('click', async () => {
    const email = input.value.trim()
    if (!email) { msg.textContent = 'Please enter your email.'; return }
    btn.textContent = 'Sending...'
    btn.disabled = true

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })

    if (error) {
      msg.textContent = error.message
      btn.textContent = 'Send Login Link →'
      btn.disabled = false
    } else {
      msg.style.color = '#27ae60'
      msg.textContent = 'Check your email — link sent.'
      btn.textContent = 'Link Sent ✓'
    }
  })

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click() })
}
