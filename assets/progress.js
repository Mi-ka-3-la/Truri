/**
 * Progress — syncs module completion between localStorage and Supabase.
 * Depends on: Hub (core.js), Supabase SDK
 * Must run before main.js (deferred, listed first) to intercept localStorage writes.
 */
(function () {
  'use strict';

  var Hub = window.Hub;
  if (!Hub) { console.error('[Progress] Hub core not loaded.'); return; }

  var COURSE_ID = Hub.getCourseId();
  if (!COURSE_ID) return; // Not on a course page

  // ── Intercept localStorage to capture completions written by main.js ──────
  var _origSet = localStorage.setItem.bind(localStorage);
  var _known   = new Set(Hub.storage.get(Hub.config.storage.progress + '.' + COURSE_ID) || []);

  localStorage.setItem = function (key, value) {
    _origSet(key, value);
    if (key !== 'course-completed') return;
    var updated;
    try { updated = new Set(JSON.parse(value || '[]')); }
    catch (e) { Hub.log.warn('[Progress] Could not parse course-completed:', e); return; }
    updated.forEach(function (moduleId) {
      if (!_known.has(moduleId)) {
        _known.add(moduleId);
        _saveModule(moduleId);
      }
    });
  };

  async function _saveModule(moduleId) {
    if (!Hub.db) return;
    try {
      var session = await Hub.getSession();
      if (!session) return;
      var result = await Hub.db.from('course_progress').upsert(
        { user_id: session.user.id, course_id: COURSE_ID, module_id: moduleId },
        { onConflict: 'user_id,course_id,module_id' }
      );
      if (result.error) Hub.log.error('[Progress] Save failed:', result.error);
    } catch (e) {
      Hub.log.error('[Progress] Unexpected error saving module:', e);
    }
  }

  // ── Load existing progress from Supabase and hydrate DOM ─────────────────
  async function _loadProgress() {
    if (!Hub.db) return;
    try {
      var session = await Hub.getSession();
      if (!session) return;

      var result = await Hub.db
        .from('course_progress')
        .select('module_id')
        .eq('user_id', session.user.id)
        .eq('course_id', COURSE_ID);

      if (result.error) { Hub.log.error('[Progress] Load failed:', result.error); return; }
      if (!result.data || !result.data.length) return;

      // Merge into localStorage
      var stored = new Set(Hub.storage.get(Hub.config.storage.progress + '.' + COURSE_ID) || []);
      var changed = false;
      result.data.forEach(function (row) {
        if (!stored.has(row.module_id)) {
          stored.add(row.module_id);
          _known.add(row.module_id);
          changed = true;
        }
      });
      if (changed) {
        _origSet('course-completed', JSON.stringify(Array.from(stored)));
        Hub.storage.set(Hub.config.storage.progress + '.' + COURSE_ID, Array.from(stored));
      }

      // Update nav dots already rendered by main.js
      var dots = Array.from(document.querySelectorAll('.nav-dot'));
      result.data.forEach(function (row) {
        var dot = dots.find(function (d) { return d.dataset && d.dataset.target === row.module_id; });
        if (dot) dot.classList.add('completed');
      });
    } catch (e) {
      Hub.log.error('[Progress] Unexpected error loading progress:', e);
    }
  }

  window.addEventListener('load', _loadProgress);

})();
