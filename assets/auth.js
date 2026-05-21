/**
 * Auth — login/signup overlay and session-gating for hub pages.
 * Depends on: Hub (core.js)
 */
(function () {
  'use strict';

  var Hub = window.Hub;
  if (!Hub) { console.error('[Auth] Hub core not loaded.'); return; }

  var INPUT_STYLE = [
    'width:100%;box-sizing:border-box;padding:12px 16px;border-radius:8px',
    'border:1px solid #333;background:#1a1a1a;color:#fff;font-size:15px',
    'outline:none;margin-bottom:10px;font-family:inherit',
  ].join(';');

  var BTN_STYLE = [
    'width:100%;padding:12px;border-radius:8px;background:#fff;color:#000',
    'font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:inherit',
  ].join(';');

  // ── Page visibility gate ──────────────────────────────────────────────────
  // Hide the page immediately; reveal once we know auth state.
  var hideEl = document.getElementById('auth-hide');

  Hub.getSession().then(function (session) {
    if (hideEl) { hideEl.remove(); hideEl = null; }
    if (!session) _showOverlay();
    _addLogoutBtn();
  });

  Hub.onAuth(function (event, session) {
    if (event === 'SIGNED_IN') {
      var o = document.getElementById('_ao');
      if (o) o.remove();
      _addLogoutBtn();
    }
    if (event === 'SIGNED_OUT') {
      var btn = document.getElementById('_logout_btn');
      if (btn) btn.remove();
      _showOverlay();
    }
  });

  // ── Overlay ───────────────────────────────────────────────────────────────
  function _showOverlay() {
    if (document.getElementById('_ao')) return;
    var o = document.createElement('div');
    o.id = '_ao';
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.97);display:flex;align-items:center;justify-content:center;z-index:99999';
    var inject = function () {
      if (document.body) document.body.prepend(o);
    };
    document.body ? inject() : document.addEventListener('DOMContentLoaded', inject);
    _renderLogin(o);
  }

  function _card(title, btnLabel, footer) {
    return '<div style="background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:48px 40px;width:360px;text-align:center;font-family:\'DM Sans\',sans-serif;box-sizing:border-box">'
      + '<p style="color:#888;font-size:13px;margin:0 0 8px">Mikaela\'s Learning Hub</p>'
      + '<h2 style="color:#fff;margin:0 0 24px;font-size:22px;font-weight:700">' + title + '</h2>'
      + '<input id="_em" type="email" placeholder="Email" autocomplete="email" style="' + INPUT_STYLE + '"/>'
      + '<input id="_pw" type="password" placeholder="Password" autocomplete="current-password" style="' + INPUT_STYLE + '"/>'
      + '<button id="_sb_btn" style="' + BTN_STYLE + '">' + btnLabel + '</button>'
      + '<p id="_err" style="color:#f56565;font-size:13px;margin:12px 0 0;display:none"></p>'
      + '<p style="color:#666;font-size:13px;margin:16px 0 0">' + footer + '</p>'
      + '</div>';
  }

  function _renderLogin(o) {
    o.innerHTML = _card('Sign in', 'Sign In',
      'No account? <a id="_sw" href="#" style="color:#fff;text-decoration:none">Sign up</a>');
    o.querySelector('#_sb_btn').addEventListener('click', _doLogin);
    o.querySelector('#_pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') _doLogin(); });
    o.querySelector('#_sw').addEventListener('click', function (e) { e.preventDefault(); _renderSignup(o); });
    setTimeout(function () { var el = o.querySelector('#_em'); if (el) el.focus(); }, 50);
  }

  function _renderSignup(o) {
    o.innerHTML = _card('Create account', 'Sign Up',
      'Already have an account? <a id="_sw" href="#" style="color:#fff;text-decoration:none">Sign in</a>');
    o.querySelector('#_sb_btn').addEventListener('click', _doSignup);
    o.querySelector('#_pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') _doSignup(); });
    o.querySelector('#_sw').addEventListener('click', function (e) { e.preventDefault(); _renderLogin(o); });
    setTimeout(function () { var el = o.querySelector('#_em'); if (el) el.focus(); }, 50);
  }

  function _setLoading(label) {
    var btn = document.getElementById('_sb_btn');
    if (btn) { btn.textContent = label; btn.disabled = true; }
  }

  function _clearLoading(label) {
    var btn = document.getElementById('_sb_btn');
    if (btn) { btn.textContent = label; btn.disabled = false; }
  }

  function _showErr(msg) {
    var err = document.getElementById('_err');
    if (!err) return;
    err.style.color = '#f56565';
    err.textContent = msg;
    err.style.display = 'block';
  }

  async function _doLogin() {
    var email = (document.getElementById('_em') || {}).value || '';
    var pw    = (document.getElementById('_pw') || {}).value || '';
    email = email.trim();
    if (!email || !pw) { _showErr('Please fill in all fields.'); return; }
    _setLoading('Signing in…');
    try {
      var result = await Hub.db.auth.signInWithPassword({ email: email, password: pw });
      if (result.error) { _showErr(result.error.message); _clearLoading('Sign In'); }
    } catch (e) {
      Hub.log.error('Login error:', e);
      _showErr('Something went wrong. Please try again.');
      _clearLoading('Sign In');
    }
  }

  async function _doSignup() {
    var email = (document.getElementById('_em') || {}).value || '';
    var pw    = (document.getElementById('_pw') || {}).value || '';
    email = email.trim();
    if (!email || !pw)     { _showErr('Please fill in all fields.'); return; }
    if (pw.length < 6)     { _showErr('Password must be at least 6 characters.'); return; }
    _setLoading('Creating account…');
    try {
      var result = await Hub.db.auth.signUp({
        email: email, password: pw,
        options: { emailRedirectTo: Hub.config.app.url },
      });
      if (result.error) {
        _showErr(result.error.message);
        _clearLoading('Sign Up');
        return;
      }
      // If email confirmation is off, session is returned immediately → onAuth closes overlay.
      // If confirmation is on, show a message instead.
      if (!result.data.session) {
        _showErr('Account created! Please confirm your email before signing in.');
        _clearLoading('Sign Up');
      }
      // Auto sign-in attempt (works when email confirmation is disabled)
      var loginResult = await Hub.db.auth.signInWithPassword({ email: email, password: pw });
      if (loginResult.error) {
        Hub.log.warn('Auto sign-in after signup failed (email confirmation may be required).');
      }
    } catch (e) {
      Hub.log.error('Signup error:', e);
      _showErr('Something went wrong. Please try again.');
      _clearLoading('Sign Up');
    }
  }

  // ── Logout button ─────────────────────────────────────────────────────────
  function _addLogoutBtn() {
    if (document.getElementById('_logout_btn')) return;
    var nav = document.querySelector('nav .nav-links');
    if (!nav) return;
    var btn = document.createElement('button');
    btn.id = '_logout_btn';
    btn.textContent = 'Sign out';
    btn.style.cssText = 'background:none;border:none;cursor:pointer;font:inherit;color:#888;font-size:14px;padding:0;margin-left:8px';
    btn.addEventListener('mouseover', function () { btn.style.color = '#fff'; });
    btn.addEventListener('mouseout',  function () { btn.style.color = '#888'; });
    btn.addEventListener('click', function () {
      Hub.db.auth.signOut().catch(function (e) { Hub.log.error('Sign out failed:', e); });
    });
    nav.appendChild(btn);
  }

})();
