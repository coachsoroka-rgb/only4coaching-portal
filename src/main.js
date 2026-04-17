import { supabase } from './lib/supabase.js'
import { renderLogin } from './pages/login.js'
import { renderAdminShell } from './pages/admin.js'
import { renderClientShell } from './pages/client.js'
import { renderOnboarding } from './pages/onboarding.js'

const app = document.getElementById('app')

// Toast utility
window.showToast = (msg) => {
  let t = document.getElementById('toast')
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t) }
  t.textContent = msg; t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2500)
}

async function init() {
  // Check URL for onboarding route
  const path = window.location.pathname
  if (path === '/onboarding' || path === '/onboarding.html') {
    app.innerHTML = ''; renderOnboarding(app); return
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    renderLogin(app)
    return
  }

  const email = session.user.email

  // Check if admin (you — Andriy)
  const ADMIN_EMAIL = 'andriy@only4coaching.com' // change to your real email
  if (email === ADMIN_EMAIL || email.includes('admin')) {
    renderAdminShell(app, session)
  } else {
    // Regular client
    renderClientShell(app, session)
  }
}

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) init()
  else renderLogin(app)
})

init()
