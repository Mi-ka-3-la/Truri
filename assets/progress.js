(function () {
  // Reuse existing client or create one
  if (!window._sb && window.supabase) {
    window._sb = window.supabase.createClient(
      'https://uwenhqayygrlfyynepiy.supabase.co',
      'sb_publishable_vl7r_Ic20vIaTwFOpSV22Q_LJV7XsQF'
    );
  }
  const client = window._sb;
  if (!client) return;

  // Derive course_id from URL path: /courses/ai-chat/... → 'ai-chat'
  const parts = window.location.pathname.split('/').filter(Boolean);
  const ci = parts.indexOf('courses');
  const COURSE_ID = ci >= 0 && parts[ci + 1] ? parts[ci + 1] : null;
  if (!COURSE_ID) return;

  // ── Intercept localStorage writes to capture new completions ───
  const _set = localStorage.setItem.bind(localStorage);
  let _known = new Set(JSON.parse(localStorage.getItem('course-completed') || '[]'));

  localStorage.setItem = function (key, value) {
    _set(key, value);
    if (key !== 'course-completed') return;
    const updated = new Set(JSON.parse(value || '[]'));
    for (const moduleId of updated) {
      if (!_known.has(moduleId)) {
        _known.add(moduleId);
        saveModule(moduleId);
      }
    }
  };

  async function saveModule(moduleId) {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;
    await client.from('course_progress').upsert(
      { user_id: session.user.id, course_id: COURSE_ID, module_id: moduleId },
      { onConflict: 'user_id,course_id,module_id' }
    );
  }

  // ── Load existing progress from Supabase and update nav dots ───
  async function loadProgress() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;

    const { data } = await client
      .from('course_progress')
      .select('module_id')
      .eq('user_id', session.user.id)
      .eq('course_id', COURSE_ID);

    if (!data || !data.length) return;

    // Merge into localStorage so main.js state stays consistent
    const stored = new Set(JSON.parse(localStorage.getItem('course-completed') || '[]'));
    let changed = false;
    for (const { module_id } of data) {
      if (!stored.has(module_id)) { stored.add(module_id); _known.add(module_id); changed = true; }
    }
    if (changed) _set('course-completed', JSON.stringify([...stored]));

    // Mark nav dots as completed directly in DOM
    const dots = Array.from(document.querySelectorAll('.nav-dot'));
    for (const { module_id } of data) {
      const dot = dots.find(d => d.dataset.target === module_id);
      if (dot) dot.classList.add('completed');
    }
  }

  // Wait until all deferred scripts (main.js) have run before touching the DOM
  window.addEventListener('load', loadProgress);
})();
