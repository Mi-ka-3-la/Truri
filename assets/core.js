/**
 * Hub Core — single source of truth for config, Supabase, session, and manifest.
 * Must load before auth.js, progress.js, notes.js, hub-state.js, course-chrome.js.
 * Requires the Supabase JS SDK to be loaded first via CDN script tag.
 */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  var CONFIG = {
    supabase: {
      url: 'https://uwenhqayygrlfyynepiy.supabase.co',
      key: 'sb_publishable_vl7r_Ic20vIaTwFOpSV22Q_LJV7XsQF',
    },
    app: {
      url: 'https://truri-nm7o.vercel.app',
    },
    storage: {
      state:    'hub.v1',
      progress: 'hub.progress',
      chrome:   'hub.chrome',
    },
  };

  // ── Logger ────────────────────────────────────────────────────────────────
  var log = {
    info:  function() { console.log.apply(console,  ['[Hub]'].concat(Array.prototype.slice.call(arguments))); },
    warn:  function() { console.warn.apply(console, ['[Hub]'].concat(Array.prototype.slice.call(arguments))); },
    error: function() { console.error.apply(console,['[Hub]'].concat(Array.prototype.slice.call(arguments))); },
  };

  // ── Supabase client ───────────────────────────────────────────────────────
  var client = null;
  if (window.supabase && window.supabase.createClient) {
    try {
      client = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
    } catch (e) {
      log.error('Supabase init failed:', e);
    }
  } else {
    log.warn('Supabase SDK not found — auth and persistence disabled.');
  }

  // ── Session cache ─────────────────────────────────────────────────────────
  // Single shared promise. Resolves once, then updates on auth state changes.
  var _sessionResolve;
  var _sessionPromise = new Promise(function (resolve) { _sessionResolve = resolve; });

  if (client) {
    // Safety timeout: if Supabase never responds, unblock the page after 4s
    var _sessionTimeout = setTimeout(function () {
      log.warn('getSession timed out — treating as unauthenticated');
      _sessionResolve(null);
    }, 4000);

    client.auth.getSession().then(function (result) {
      clearTimeout(_sessionTimeout);
      _sessionResolve(result.data.session || null);
    }).catch(function (e) {
      clearTimeout(_sessionTimeout);
      log.error('getSession failed:', e);
      _sessionResolve(null);
    });

    client.auth.onAuthStateChange(function (event, session) {
      // Replace the promise so subsequent callers get the new session immediately
      _sessionPromise = Promise.resolve(session || null);
      _sessionResolve = null;
    });
  } else {
    _sessionResolve(null);
  }

  function getSession() {
    return _sessionPromise;
  }

  // ── Manifest cache ────────────────────────────────────────────────────────
  var _manifestPromise = null;

  function getManifest() {
    if (_manifestPromise) return _manifestPromise;
    var url = _resolveAssetUrl('courses.json');
    _manifestPromise = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function (e) {
        log.error('Manifest load failed:', e);
        return { items: [] };
      });
    return _manifestPromise;
  }

  // Resolve a filename inside assets/ relative to this script's location.
  function _resolveAssetUrl(filename) {
    var src = document.currentScript && document.currentScript.src;
    if (src) return src.replace(/\/[^\/]+$/, '/') + filename;
    // Fallback: walk up from current page to find /assets/
    var depth = (window.location.pathname.match(/\//g) || []).length - 1;
    var prefix = depth > 1 ? Array(depth).join('../') : '';
    return prefix + 'assets/' + filename;
  }

  // ── Course context ────────────────────────────────────────────────────────
  function getCourseId() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    var ci = parts.indexOf('courses');
    return (ci >= 0 && parts[ci + 1]) ? parts[ci + 1] : null;
  }

  // ── Auth state listeners ──────────────────────────────────────────────────
  var _authListeners = [];

  function onAuth(fn) {
    if (!client) return function () {};
    var sub = client.auth.onAuthStateChange(function (event, session) {
      fn(event, session || null);
    });
    return function () { if (sub && sub.data) sub.data.subscription.unsubscribe(); };
  }

  // ── localStorage helpers ──────────────────────────────────────────────────
  var storage = {
    get: function (key) {
      try { return JSON.parse(localStorage.getItem(key)); }
      catch (e) { log.warn('storage.get failed for', key, e); return null; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); }
      catch (e) { log.warn('storage.set failed for', key, e); }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); }
      catch (e) { log.warn('storage.remove failed for', key, e); }
    },
  };

  // ── Public API ────────────────────────────────────────────────────────────
  window.Hub = {
    config:      CONFIG,
    db:          client,
    getSession:  getSession,
    getManifest: getManifest,
    getCourseId: getCourseId,
    onAuth:      onAuth,
    storage:     storage,
    log:         log,
  };

  // Backward compat shim — remove once all scripts use Hub.db
  window._sb = client;

})();
