(async function () {
  const client = window._sb;

  const { data: { session } } = await client.auth.getSession();

  // Reveal page now that we know auth state
  const hide = document.getElementById('auth-hide');
  if (hide) hide.remove();

  if (!session) showOverlay();

  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      const o = document.getElementById('_ao');
      if (o) o.remove();
      addLogoutBtn();
    }
    if (event === 'SIGNED_OUT') {
      const btn = document.getElementById('_logout_btn');
      if (btn) btn.remove();
      showOverlay();
    }
  });

  if (session) addLogoutBtn();

  // ── Overlay ──────────────────────────────────────────────────────────────

  function showOverlay() {
    if (document.getElementById('_ao')) return;
    const o = document.createElement('div');
    o.id = '_ao';
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.97);display:flex;align-items:center;justify-content:center;z-index:99999';
    const inject = () => { if (document.body) document.body.prepend(o); };
    document.body ? inject() : document.addEventListener('DOMContentLoaded', inject);
    renderLogin(o);
  }

  function card(title, btnLabel, footer) {
    const inputStyle = 'width:100%;box-sizing:border-box;padding:12px 16px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:15px;outline:none;margin-bottom:10px;font-family:inherit';
    return `<div style="background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:48px 40px;width:360px;text-align:center;font-family:'DM Sans',sans-serif;box-sizing:border-box">
      <p style="color:#888;font-size:13px;margin:0 0 8px">Mikaela's Learning Hub</p>
      <h2 style="color:#fff;margin:0 0 24px;font-size:22px;font-weight:700">${title}</h2>
      <input id="_em" type="email" placeholder="Email" autocomplete="email" style="${inputStyle}"/>
      <input id="_pw" type="password" placeholder="Password" autocomplete="current-password" style="${inputStyle}"/>
      <button id="_sb_btn" style="width:100%;padding:12px;border-radius:8px;background:#fff;color:#000;font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:inherit">${btnLabel}</button>
      <p id="_err" style="color:#f56565;font-size:13px;margin:12px 0 0;display:none"></p>
      <p style="color:#666;font-size:13px;margin:16px 0 0">${footer}</p>
    </div>`;
  }

  function renderLogin(o) {
    o.innerHTML = card('Sign in', 'Sign In',
      'No account? <a id="_sw" href="#" style="color:#fff;text-decoration:none">Sign up</a>');
    o.querySelector('#_sb_btn').addEventListener('click', doLogin);
    o.querySelector('#_pw').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    o.querySelector('#_sw').addEventListener('click', e => { e.preventDefault(); renderSignup(o); });
    setTimeout(() => o.querySelector('#_em')?.focus(), 50);
  }

  function renderSignup(o) {
    o.innerHTML = card('Create account', 'Sign Up',
      'Already have an account? <a id="_sw" href="#" style="color:#fff;text-decoration:none">Sign in</a>');
    o.querySelector('#_sb_btn').addEventListener('click', doSignup);
    o.querySelector('#_pw').addEventListener('keydown', e => { if (e.key === 'Enter') doSignup(); });
    o.querySelector('#_sw').addEventListener('click', e => { e.preventDefault(); renderLogin(o); });
    setTimeout(() => o.querySelector('#_em')?.focus(), 50);
  }

  async function doLogin() {
    const email = document.getElementById('_em').value.trim();
    const password = document.getElementById('_pw').value;
    const btn = document.getElementById('_sb_btn');
    if (!email || !password) { showErr('Please fill in all fields.'); return; }
    btn.textContent = 'Signing in…'; btn.disabled = true;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) { showErr(error.message); btn.textContent = 'Sign In'; btn.disabled = false; }
  }

  async function doSignup() {
    const email = document.getElementById('_em').value.trim();
    const password = document.getElementById('_pw').value;
    const btn = document.getElementById('_sb_btn');
    if (!email || !password) { showErr('Please fill in all fields.'); return; }
    if (password.length < 6) { showErr('Password must be at least 6 characters.'); return; }
    btn.textContent = 'Creating account…'; btn.disabled = true;
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: 'https://truri-nm7o.vercel.app' } });
    if (error) {
      showErr(error.message); btn.textContent = 'Sign Up'; btn.disabled = false;
    } else if (data.session) {
      // Email confirmation is off — user is logged in immediately, overlay closes via onAuthStateChange
    } else {
      const err = document.getElementById('_err');
      err.style.color = '#68d391';
      err.textContent = 'Check your email to confirm your account.';
      err.style.display = 'block';
      btn.textContent = 'Sign Up'; btn.disabled = false;
    }
  }

  function showErr(msg) {
    const err = document.getElementById('_err');
    if (!err) return;
    err.style.color = '#f56565';
    err.textContent = msg;
    err.style.display = 'block';
  }

  // ── Logout button ─────────────────────────────────────────────────────────

  function addLogoutBtn() {
    if (document.getElementById('_logout_btn')) return;
    const nav = document.querySelector('nav .nav-links');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.id = '_logout_btn';
    btn.textContent = 'Sign out';
    btn.style.cssText = 'background:none;border:none;cursor:pointer;font:inherit;color:#888;font-size:14px;padding:0;margin-left:8px';
    btn.addEventListener('mouseover', () => btn.style.color = '#fff');
    btn.addEventListener('mouseout', () => btn.style.color = '#888');
    btn.addEventListener('click', () => client.auth.signOut());
    nav.appendChild(btn);
  }
})();
