/* course-chrome.js — runs INSIDE individual course pages.
   Non-invasive: uses Shadow DOM to avoid clashing with course CSS.
   Provides: visited-mark, scroll-progress bar, "Hub · Next" floating pill.
*/
(() => {
  'use strict';

  const STORAGE_KEY = 'avise.learn.v1';

  // Compute paths relative to this script's location
  const scriptSrc = (document.currentScript && document.currentScript.src) || '';
  const assetsBase = scriptSrc.replace(/[^/]+$/, ''); // .../assets/
  const repoBase = assetsBase.replace(/assets\/$/, ''); // .../
  const manifestUrl = assetsBase + 'courses.json';

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

  const markVisited = (slug) => {
    const s = loadState();
    s.visited[slug] = { ts: Date.now() };
    s.lastOrder = [slug, ...s.lastOrder.filter(x => x !== slug)].slice(0, 10);
    saveState(s);
  };

  // ---------- detect current slug from URL ----------
  const detectCurrent = (manifest) => {
    const path = window.location.pathname;
    // Match any item whose url is a suffix of the pathname
    return manifest.items.find(it => {
      const seg = '/' + it.url;
      return path.endsWith(seg) || path.endsWith(it.url);
    });
  };

  const findNext = (manifest, current) => {
    if (!current) return null;
    // Next within same section (skip self)
    const sameSection = manifest.items.filter(
      i => i.kind === current.kind && i.section === current.section
    );
    const idx = sameSection.findIndex(i => i.slug === current.slug);
    if (idx >= 0 && sameSection[idx + 1]) return sameSection[idx + 1];
    // Otherwise next item in same track
    const sameTrack = manifest.items.filter(i => i.track === current.track);
    const ti = sameTrack.findIndex(i => i.slug === current.slug);
    if (ti >= 0 && sameTrack[ti + 1]) return sameTrack[ti + 1];
    return null;
  };

  // ---------- inject UI (Shadow DOM for isolation) ----------
  const inject = (current, next) => {
    const host = document.createElement('div');
    host.id = '__avise-chrome';
    host.style.cssText = 'all:initial; position:fixed; inset:0; pointer-events:none; z-index:2147483647;';
    document.documentElement.appendChild(host);

    const root = host.attachShadow({ mode: 'open' });

    const trackLabel = {
      avise: 'Avise track',
      knowledge: 'Knowledge track',
      briefs: 'Briefs'
    }[current?.track] || 'Hub';

    const trackUrl = {
      avise: 'avise.html',
      knowledge: 'knowledge.html',
      briefs: 'briefs.html'
    }[current?.track] || 'index.html';

    const colorByTrack = {
      avise: '#2A7B9B',
      knowledge: '#1E40AF',
      briefs: '#475569'
    }[current?.track] || '#1F1D1B';

    root.innerHTML = `
      <style>
        :host, * { box-sizing: border-box; }
        .bar {
          position: fixed; top: 0; left: 0; right: 0;
          height: 3px; background: rgba(0,0,0,0.06);
          pointer-events: none; z-index: 1;
        }
        .bar > .fill {
          height: 100%; width: 0%;
          background: ${colorByTrack};
          transition: width 80ms linear;
        }

        .pill-wrap {
          position: fixed; bottom: 20px; right: 20px;
          pointer-events: auto;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          display: flex; align-items: stretch; gap: 0;
          background: #FFFFFF;
          color: #1F1D1B;
          border: 1px solid #E8E0D4;
          border-radius: 999px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
          font-size: 13px;
          max-width: calc(100vw - 40px);
          overflow: hidden;
          transition: transform 200ms ease, opacity 200ms ease;
        }
        .pill-wrap.collapsed { transform: translateY(80px); opacity: 0; pointer-events:none; }
        .pill-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 14px;
          color: inherit; text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }
        .pill-link.back { color: ${colorByTrack}; }
        .pill-link:hover { background: #FBF8F3; }
        .pill-sep { width: 1px; background: #EFE7DA; }
        .pill-next {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 14px 9px 12px;
          color: inherit; text-decoration: none;
          font-weight: 500;
          max-width: 340px;
        }
        .pill-next-label {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #9E9690; font-weight: 700;
          display: block;
        }
        .pill-next-title {
          display: block;
          font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 240px;
        }
        .pill-toggle {
          background: transparent; border: 0; cursor: pointer;
          padding: 0 10px;
          color: #9E9690;
          font-size: 16px; line-height: 1;
          border-left: 1px solid #EFE7DA;
        }
        .pill-toggle:hover { color: #1F1D1B; }

        .reopen {
          position: fixed; bottom: 20px; right: 20px;
          pointer-events: auto;
          background: #FFFFFF; color: ${colorByTrack};
          border: 1px solid #E8E0D4;
          border-radius: 999px;
          width: 36px; height: 36px;
          display: none;
          align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        }
        .reopen.show { display: inline-flex; }
        .reopen svg { width: 16px; height: 16px; }

        svg { stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

        @media (max-width: 640px) {
          .pill-next-title { max-width: 140px; }
          .pill-next { max-width: 200px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-wrap, .bar > .fill { transition: none; }
        }
      </style>

      <div class="bar"><div class="fill" id="fill"></div></div>

      <div class="pill-wrap" id="pill">
        <a class="pill-link back" href="${repoBase}${trackUrl}" title="Back to ${trackLabel}">
          <svg width="14" height="14" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"></polyline></svg>
          <span>${trackLabel}</span>
        </a>
        ${next ? `
          <div class="pill-sep"></div>
          <a class="pill-next" href="${repoBase}${next.url}" title="Next: ${escapeAttr(next.title)}">
            <span>
              <span class="pill-next-label">Next</span>
              <span class="pill-next-title">${escapeHtml(next.title)}</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"></polyline></svg>
          </a>
        ` : ''}
        <button class="pill-toggle" id="toggle" title="Hide" aria-label="Hide chrome">×</button>
      </div>

      <button class="reopen" id="reopen" title="Show navigator" aria-label="Show navigator">
        <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"></polyline></svg>
      </button>
    `;

    const fill = root.getElementById('fill');
    const updateBar = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      fill.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();

    const pill = root.getElementById('pill');
    const toggle = root.getElementById('toggle');
    const reopen = root.getElementById('reopen');

    const COLLAPSE_KEY = 'avise.learn.chrome.collapsed';
    const isCollapsed = () => {
      try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
    };
    const setCollapsed = (v) => {
      pill.classList.toggle('collapsed', v);
      reopen.classList.toggle('show', v);
      try { localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0'); } catch {}
    };
    setCollapsed(isCollapsed());
    toggle.addEventListener('click', () => setCollapsed(true));
    reopen.addEventListener('click', () => setCollapsed(false));
  };

  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

  // ---------- boot ----------
  const boot = async () => {
    let manifest;
    try {
      manifest = await fetch(manifestUrl, { cache: 'no-cache' }).then(r => r.json());
    } catch { return; }
    const current = detectCurrent(manifest);
    if (current) markVisited(current.slug);
    const next = findNext(manifest, current);
    inject(current, next);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
