/* hub-state.js — runs on hub pages (index, avise, knowledge, briefs)
   Provides: ✓ visited badges, "Continue" rail, Cmd+K palette, filter chips.
   Depends on: Hub (core.js)
*/
(() => {
  'use strict';

  const STORAGE_KEY = window.Hub ? window.Hub.config.storage.state : 'hub.v1';

  // ---------- state ----------
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { visited: {}, lastOrder: [] };
      const s = JSON.parse(raw);
      return { visited: s.visited || {}, lastOrder: s.lastOrder || [] };
    } catch { return { visited: {}, lastOrder: [] }; }
  };
  const saveState = (s) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  };

  // ---------- manifest — use Hub cache if available ----------
  const getManifest = () => window.Hub
    ? window.Hub.getManifest()
    : fetch('assets/courses.json').then(r => r.json()).catch(() => ({ items: [] }));

  // ---------- formatting ----------
  const relTime = (ts) => {
    if (!ts) return '';
    const diff = Math.max(0, Date.now() - ts);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    const mo = Math.floor(d / 30);
    return `${mo}mo ago`;
  };

  // ---------- ✓ badges on existing catalog cards ----------
  const markCatalogCards = (state) => {
    document.querySelectorAll('a.course-card[href]').forEach(card => {
      // Find slug by matching href against the URL pattern
      const href = card.getAttribute('href');
      // e.g. "courses/avise-architecture/index.html" -> "avise-architecture"
      const m = href.match(/(?:courses|briefs|patterns)\/([^/]+)\/index\.html$/);
      if (!m) return;
      let slug = m[1];
      if (href.startsWith('patterns/')) slug = 'patterns-' + slug;
      if (href.startsWith('briefs/'))   slug = 'planning-' + slug.replace(/^planning-/, '');
      // Manifest uses specific slugs; just match by href instead:
      // (override) match by full href to manifest items if available later
      card.dataset.slug = slug;
      const visit = state.visited[slug] || state.visited[card.dataset.slugAlt];
      if (visit) addCheckBadge(card, visit.ts);
    });
  };

  const addCheckBadge = (card, ts) => {
    if (card.querySelector('.hs-badge')) return;
    const tag = card.querySelector('.card-tag');
    if (!tag) return;
    const badge = document.createElement('span');
    badge.className = 'hs-badge';
    badge.title = `Visited ${relTime(ts)}`;
    badge.innerHTML = '<svg viewBox="0 0 20 20" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,11 8,15 16,6"></polyline></svg><span>Read</span>';
    tag.insertAdjacentElement('afterend', badge);
  };

  // Better matching: rebuild slug-to-card from manifest URLs
  const linkBadgesByManifest = async (state) => {
    const manifest = await getManifest();
    const cards = Array.from(document.querySelectorAll('a.course-card[href]'));
    manifest.items.forEach(item => {
      const card = cards.find(c => c.getAttribute('href') === item.url);
      if (!card) return;
      card.dataset.slug = item.slug;
      card.dataset.audience = (item.audience || []).join(',');
      card.dataset.lang = item.lang || 'en';
      card.dataset.minutes = String(item.minutes || 0);
      card.dataset.section = item.section || '';
      card.dataset.tags = (item.tags || []).join(',');
      const visit = state.visited[item.slug];
      if (visit) addCheckBadge(card, visit.ts);
    });
  };

  // ---------- "Continue" rail (index page) ----------
  const renderContinueRail = async (state) => {
    if (!document.body.classList.contains('hub-landing')) return;
    if (!state.lastOrder.length) return;
    const manifest = await getManifest();
    const itemsBySlug = Object.fromEntries(manifest.items.map(i => [i.slug, i]));
    const recent = state.lastOrder
      .map(slug => itemsBySlug[slug])
      .filter(Boolean)
      .slice(0, 3);
    if (!recent.length) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const rail = document.createElement('section');
    rail.className = 'continue-rail animate-in';
    rail.innerHTML = `
      <div class="continue-head">
        <span class="continue-eyebrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="5,3 19,12 5,21"></polygon></svg> Continue where you left off</span>
      </div>
      <div class="continue-cards">
        ${recent.map(it => `
          <a class="continue-card" href="${it.url}" data-slug="${it.slug}">
            <span class="continue-tag tag-${it.color}">${escapeHtml(item_section_label(it))}</span>
            <span class="continue-title">${escapeHtml(it.title)}</span>
            <span class="continue-meta">${relTime(state.visited[it.slug]?.ts)} · ${it.minutes || '?'} min</span>
          </a>
        `).join('')}
      </div>
    `;
    hero.insertAdjacentElement('afterend', rail);
  };

  const item_section_label = (it) => it.kind === 'brief' ? 'Brief' : it.kind === 'patterns' ? 'Patterns' : it.section;

  // ---------- Filter chips (avise.html / knowledge.html / briefs.html) ----------
  const renderFilterChips = () => {
    const firstCourses = document.querySelector('.courses');
    if (!firstCourses) return;
    if (!document.querySelector('a.course-card[data-audience]')) {
      // wait until manifest hydration runs
      return;
    }
    if (document.querySelector('.filter-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'filter-bar';
    bar.innerHTML = `
      <div class="filter-group" data-key="audience">
        <span class="filter-label">For</span>
        <button class="chip active" data-val="">All</button>
        <button class="chip" data-val="engineer">Engineers</button>
        <button class="chip" data-val="pm">PMs</button>
        <button class="chip" data-val="ba">BA / QA</button>
        <button class="chip" data-val="solutions">Solutions</button>
      </div>
      <div class="filter-group" data-key="lang">
        <span class="filter-label">Lang</span>
        <button class="chip active" data-val="">Any</button>
        <button class="chip" data-val="en">EN</button>
        <button class="chip" data-val="ro">RO</button>
      </div>
      <div class="filter-group" data-key="minutes">
        <span class="filter-label">Length</span>
        <button class="chip active" data-val="">Any</button>
        <button class="chip" data-val="lt30">&lt; 30 min</button>
        <button class="chip" data-val="30-60">30–60</button>
        <button class="chip" data-val="gt60">60+</button>
      </div>
    `;

    const firstHeading = document.querySelector('.section-heading');
    (firstHeading || firstCourses).insertAdjacentElement('beforebegin', bar);

    const filters = { audience: '', lang: '', minutes: '' };
    bar.querySelectorAll('.filter-group').forEach(g => {
      const key = g.dataset.key;
      g.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        g.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filters[key] = btn.dataset.val;
        applyFilters(filters);
      });
    });
  };

  const applyFilters = (f) => {
    document.querySelectorAll('a.course-card').forEach(card => {
      let show = true;
      if (f.audience && !(card.dataset.audience || '').split(',').includes(f.audience)) show = false;
      if (f.lang && card.dataset.lang !== f.lang) show = false;
      if (f.minutes) {
        const m = parseInt(card.dataset.minutes || '0', 10);
        if (f.minutes === 'lt30' && !(m > 0 && m < 30)) show = false;
        if (f.minutes === '30-60' && !(m >= 30 && m <= 60)) show = false;
        if (f.minutes === 'gt60' && !(m > 60)) show = false;
      }
      card.style.display = show ? '' : 'none';
    });
    // Hide section headings whose siblings are all hidden
    document.querySelectorAll('.section-heading').forEach(h => {
      let n = h.nextElementSibling;
      let visible = 0;
      while (n && !n.classList.contains('section-heading')) {
        if (n.classList.contains('courses')) {
          visible += n.querySelectorAll('a.course-card:not([style*="display: none"])').length;
        }
        n = n.nextElementSibling;
      }
      h.style.display = visible ? '' : 'none';
    });
  };

  // ---------- Cmd+K palette ----------
  const initPalette = async () => {
    const manifest = await getManifest();
    const items = manifest.items;

    const wrap = document.createElement('div');
    wrap.className = 'cmdk-wrap';
    wrap.setAttribute('hidden', '');
    wrap.innerHTML = `
      <div class="cmdk-backdrop"></div>
      <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search courses">
        <div class="cmdk-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input class="cmdk-input" type="text" placeholder="Search courses, briefs, patterns…" autocomplete="off" />
          <kbd class="cmdk-kbd">esc</kbd>
        </div>
        <ul class="cmdk-list" role="listbox"></ul>
        <div class="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const input = wrap.querySelector('.cmdk-input');
    const list = wrap.querySelector('.cmdk-list');
    let active = 0;
    let results = [];

    const score = (q, item) => {
      if (!q) return 1;
      const hay = (item.title + ' ' + item.desc + ' ' + (item.tags||[]).join(' ') + ' ' + item.section).toLowerCase();
      const ql = q.toLowerCase();
      if (item.title.toLowerCase().startsWith(ql)) return 1000;
      if (item.title.toLowerCase().includes(ql)) return 500;
      if (hay.includes(ql)) return 100;
      // Fuzzy: all chars in order
      let i = 0;
      for (const ch of ql) {
        const idx = hay.indexOf(ch, i);
        if (idx === -1) return 0;
        i = idx + 1;
      }
      return 10;
    };

    const render = () => {
      const q = input.value.trim();
      results = items
        .map(it => ({ it, s: score(q, it) }))
        .filter(r => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12)
        .map(r => r.it);
      active = 0;
      if (!results.length) {
        list.innerHTML = `<li class="cmdk-empty">No matches</li>`;
        return;
      }
      list.innerHTML = results.map((it, i) => `
        <li class="cmdk-item ${i===0?'active':''}" role="option" data-i="${i}">
          <span class="cmdk-dot dot-${it.color}"></span>
          <div class="cmdk-text">
            <span class="cmdk-title">${escapeHtml(it.title)}</span>
            <span class="cmdk-sub">${escapeHtml(item_section_label(it))} · ${it.minutes||'?'} min · ${(it.lang||'en').toUpperCase()}</span>
          </div>
          <span class="cmdk-kind">${it.kind}</span>
        </li>
      `).join('');
      list.querySelectorAll('.cmdk-item').forEach(li => {
        li.addEventListener('mouseenter', () => setActive(parseInt(li.dataset.i, 10)));
        li.addEventListener('click', () => openItem(parseInt(li.dataset.i, 10)));
      });
    };
    const setActive = (i) => {
      active = (i + results.length) % results.length;
      list.querySelectorAll('.cmdk-item').forEach((li, idx) => {
        li.classList.toggle('active', idx === active);
      });
      const el = list.children[active];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    };
    const openItem = (i) => {
      const it = results[i];
      if (!it) return;
      window.location.href = it.url;
    };
    const open = () => {
      wrap.removeAttribute('hidden');
      input.value = '';
      render();
      setTimeout(() => input.focus(), 0);
    };
    const close = () => wrap.setAttribute('hidden', '');

    input.addEventListener('input', render);
    wrap.querySelector('.cmdk-backdrop').addEventListener('click', close);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter')     { e.preventDefault(); openItem(active); }
    });
    document.addEventListener('keydown', (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (wrap.hasAttribute('hidden')) open(); else close();
      } else if (e.key === '/' && document.activeElement === document.body && wrap.hasAttribute('hidden')) {
        e.preventDefault();
        open();
      }
    });

    // Inject the small "⌘K" hint into the nav
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('.cmdk-trigger')) {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const trig = document.createElement('button');
      trig.className = 'cmdk-trigger';
      trig.type = 'button';
      trig.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span class="cmdk-trigger-text">Search</span>
        <kbd>${isMac ? '⌘' : 'Ctrl'} K</kbd>
      `;
      trig.addEventListener('click', open);
      navLinks.insertBefore(trig, navLinks.querySelector('.nav-pill'));
    }
  };

  // ---------- utils ----------
  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ---------- boot ----------
  const boot = async () => {
    const state = loadState();
    await linkBadgesByManifest(state);
    renderFilterChips();
    await renderContinueRail(state);
    await initPalette();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
