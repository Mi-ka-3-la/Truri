/**
 * Notes — charting-method sidebar with text-selection trigger.
 * Depends on: Hub (core.js)
 */
(function () {
  'use strict';

  var Hub = window.Hub;
  if (!Hub) { console.error('[Notes] Hub core not loaded.'); return; }

  var COURSE_ID = Hub.getCourseId();
  if (!COURSE_ID) return;

  var _notes  = [];
  var _isOpen = false;
  var _pending = { topic: '', moduleId: '' };

  // ── Styles ────────────────────────────────────────────────────────────────
  var CSS = [
    '#nt-toggle{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:9100;',
    'background:#161616;border:1px solid #2a2a2a;border-left:none;border-radius:0 8px 8px 0;',
    'padding:14px 7px;cursor:pointer;writing-mode:vertical-lr;font-size:11px;font-weight:700;',
    'color:#555;letter-spacing:.08em;transition:color .2s,background .2s;',
    'font-family:"DM Sans",sans-serif;user-select:none;}',
    '#nt-toggle:hover,#nt-toggle.open{color:#fff;background:#1f1f1f;}',

    '#nt-panel{position:fixed;left:-380px;top:0;bottom:0;width:360px;background:#0d0d0d;',
    'border-right:1px solid #1f1f1f;z-index:9099;display:flex;flex-direction:column;',
    'transition:left .25s cubic-bezier(.4,0,.2,1);font-family:"DM Sans",sans-serif;}',
    '#nt-panel.open{left:0;}',

    '#nt-head{display:flex;align-items:center;justify-content:space-between;',
    'padding:14px 16px;border-bottom:1px solid #1a1a1a;flex-shrink:0;}',
    '#nt-head h3{margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:.04em;}',
    '#nt-head span{font-size:10px;color:#444;margin-left:8px;font-weight:400;letter-spacing:0;}',
    '#nt-close{background:none;border:none;color:#444;cursor:pointer;font-size:20px;',
    'line-height:1;padding:0 2px;}#nt-close:hover{color:#fff;}',

    '#nt-scroll{overflow-y:auto;flex:1;}',
    '.nt-table{width:100%;border-collapse:collapse;font-size:11.5px;}',
    '.nt-table thead th{padding:8px 10px;text-align:left;font-size:9.5px;',
    'text-transform:uppercase;letter-spacing:.1em;color:#444;font-weight:600;',
    'border-bottom:1px solid #1a1a1a;position:sticky;top:0;background:#0d0d0d;}',
    '.nt-table tbody tr{border-bottom:1px solid #141414;}',
    '.nt-table tbody tr:hover{background:rgba(255,255,255,.02);}',
    '.nt-table td{padding:10px;vertical-align:top;color:#bbb;line-height:1.55;}',
    '.nt-table td.td-topic{color:#777;font-size:10.5px;width:90px;word-break:break-word;}',
    '.nt-table td.td-desc{width:150px;}.nt-table td.td-obs{color:#555;font-size:10.5px;}',
    '.nt-del{float:right;background:none;border:none;color:#2a2a2a;cursor:pointer;',
    'font-size:13px;padding:0 0 2px 4px;line-height:1;}',
    '.nt-del:hover{color:#f56565;}',
    '.nt-empty{padding:32px 16px;text-align:center;color:#333;font-size:12px;line-height:1.7;}',

    '.nt-input-row td{padding:8px 10px;background:rgba(255,255,255,.02);}',
    '.nt-input-row input,.nt-input-row textarea{width:100%;box-sizing:border-box;',
    'background:#141414;border:1px solid #2a2a2a;border-radius:5px;color:#eee;',
    'font-size:11.5px;padding:6px 8px;font-family:"DM Sans",sans-serif;resize:none;outline:none;}',
    '.nt-input-row input:focus,.nt-input-row textarea:focus{border-color:#444;}',
    '#nt-save{margin-top:6px;background:#fff;color:#000;border:none;border-radius:4px;',
    'padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:"DM Sans",sans-serif;}',
    '#nt-save:hover{background:#e8e8e8;}',

    '#nt-float{position:fixed;z-index:9200;background:#fff;color:#000;border:none;',
    'border-radius:6px;padding:5px 11px;font-size:11.5px;font-weight:700;cursor:pointer;',
    'font-family:"DM Sans",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.6);',
    'display:none;white-space:nowrap;}',
    '#nt-float::before{content:"";position:absolute;top:-5px;left:12px;width:0;height:0;',
    'border-left:5px solid transparent;border-right:5px solid transparent;',
    'border-bottom:5px solid #fff;}',
    '#nt-float:hover{background:#f0f0f0;}',
  ].join('');

  // ── Build DOM ─────────────────────────────────────────────────────────────
  function _build() {
    var style = document.createElement('style');
    style.id = 'nt-styles';
    if (!document.getElementById('nt-styles')) document.head.appendChild(style);
    style.textContent = CSS;

    document.body.insertAdjacentHTML('beforeend', [
      '<button id="nt-toggle" title="Toggle notes">Notes</button>',
      '<div id="nt-panel">',
        '<div id="nt-head">',
          '<div><h3>Notes <span>Charting Method</span></h3></div>',
          '<button id="nt-close" title="Close">\xd7</button>',
        '</div>',
        '<div id="nt-scroll">',
          '<table class="nt-table">',
            '<thead><tr><th>Topic</th><th>Description</th><th>Observations</th></tr></thead>',
            '<tbody id="nt-tbody"></tbody>',
          '</table>',
        '</div>',
      '</div>',
      '<button id="nt-float">+ Add note</button>',
    ].join(''));

    document.getElementById('nt-toggle').addEventListener('click', _toggle);
    document.getElementById('nt-close').addEventListener('click', _close);
    document.getElementById('nt-float').addEventListener('click', _onFloat);
  }

  // ── Panel open/close ──────────────────────────────────────────────────────
  function _toggle() { _isOpen ? _close() : _open(); }

  function _open() {
    _isOpen = true;
    document.getElementById('nt-panel').classList.add('open');
    document.getElementById('nt-toggle').classList.add('open');
  }

  function _close() {
    _isOpen = false;
    document.getElementById('nt-panel').classList.remove('open');
    document.getElementById('nt-toggle').classList.remove('open');
  }

  // ── Text selection ────────────────────────────────────────────────────────
  function _currentModuleId() {
    var mods = Array.from(document.querySelectorAll('.module'));
    if (!mods.length) return 'general';
    var best = mods[0], bestVis = 0;
    mods.forEach(function (m) {
      var r   = m.getBoundingClientRect();
      var vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (vis > bestVis) { bestVis = vis; best = m; }
    });
    return best.id || 'general';
  }

  document.addEventListener('mouseup', _onSelection);
  document.addEventListener('touchend', _onSelection);

  function _onSelection(e) {
    var btn = document.getElementById('nt-float');
    if (!btn) return;
    if (e.target.closest('#nt-panel') || e.target.closest('#nt-float')) return;
    var sel  = window.getSelection();
    var text = sel ? sel.toString().trim() : '';
    if (text.length > 2) {
      _pending.topic    = text.slice(0, 100);
      _pending.moduleId = _currentModuleId();
      try {
        var rect = sel.getRangeAt(0).getBoundingClientRect();
        btn.style.top  = (window.scrollY + rect.bottom + 8) + 'px';
        btn.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 130)) + 'px';
        btn.style.display = 'block';
      } catch (ex) { Hub.log.warn('[Notes] Could not position float button:', ex); }
    } else {
      btn.style.display = 'none';
    }
  }

  document.addEventListener('mousedown', function (e) {
    var btn = document.getElementById('nt-float');
    if (btn && !e.target.closest('#nt-float')) btn.style.display = 'none';
  });

  function _onFloat() {
    document.getElementById('nt-float').style.display = 'none';
    _open();
    _showInputRow(_pending.topic, _pending.moduleId);
  }

  // ── Input row ─────────────────────────────────────────────────────────────
  function _showInputRow(topic, moduleId) {
    var tbody = document.getElementById('nt-tbody');
    if (!tbody) return;
    var old = document.getElementById('nt-input-row');
    if (old) old.remove();
    var tr = document.createElement('tr');
    tr.id        = 'nt-input-row';
    tr.className = 'nt-input-row';
    tr.innerHTML = [
      '<td class="td-topic"><input id="_nt_topic" type="text" value="' + _esc(topic) + '" placeholder="Topic"/></td>',
      '<td class="td-desc">',
        '<textarea id="_nt_desc" rows="3" placeholder="Your note…"></textarea>',
        '<button id="nt-save">Save</button>',
      '</td>',
      '<td class="td-obs"><input id="_nt_obs" type="text" placeholder="Observations"/></td>',
    ].join('');
    tbody.insertBefore(tr, tbody.firstChild);
    setTimeout(function () { var el = document.getElementById('_nt_desc'); if (el) el.focus(); }, 50);
    document.getElementById('nt-save').addEventListener('click', function () { _saveNote(moduleId); });
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  async function _saveNote(moduleId) {
    var topic = (document.getElementById('_nt_topic') || {}).value || '';
    var desc  = (document.getElementById('_nt_desc')  || {}).value || '';
    var obs   = (document.getElementById('_nt_obs')   || {}).value || '';
    topic = topic.trim(); desc = desc.trim(); obs = obs.trim();
    if (!desc) return;

    var payload = JSON.stringify({ topic: topic, description: desc, observations: obs });
    var savedId = null;

    if (Hub.db) {
      try {
        var session = await Hub.getSession();
        if (session) {
          var result = await Hub.db.from('notes').insert({
            user_id:   session.user.id,
            course_id: COURSE_ID,
            module_id: moduleId,
            content:   payload,
          }).select('id').single();
          if (result.error) Hub.log.error('[Notes] Save failed:', result.error);
          else if (result.data) savedId = result.data.id;
        }
      } catch (e) {
        Hub.log.error('[Notes] Unexpected save error:', e);
      }
    }

    _notes.unshift({ id: savedId, module_id: moduleId, topic: topic, description: desc, observations: obs });
    _render();
  }

  async function _deleteNote(i) {
    var note = _notes[i];
    if (note.id && Hub.db) {
      try {
        var session = await Hub.getSession();
        if (session) {
          var result = await Hub.db.from('notes').delete().eq('id', note.id);
          if (result.error) Hub.log.error('[Notes] Delete failed:', result.error);
        }
      } catch (e) {
        Hub.log.error('[Notes] Unexpected delete error:', e);
      }
    }
    _notes.splice(i, 1);
    _render();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function _render() {
    var tbody = document.getElementById('nt-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!_notes.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="nt-empty">No notes yet.<br>Select any text to add one.</td></tr>';
      return;
    }
    _notes.forEach(function (n, i) {
      var tr = document.createElement('tr');
      tr.innerHTML = [
        '<td class="td-topic">' + _esc(n.topic || n.module_id) + '</td>',
        '<td class="td-desc">',
          '<button class="nt-del" data-i="' + i + '" title="Delete">\xd7</button>',
          _esc(n.description),
        '</td>',
        '<td class="td-obs">' + _esc(n.observations) + '</td>',
      ].join('');
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.nt-del').forEach(function (btn) {
      btn.addEventListener('click', function () { _deleteNote(parseInt(btn.dataset.i, 10)); });
    });
  }

  // ── Load from Supabase ────────────────────────────────────────────────────
  async function _load() {
    if (!Hub.db) { _render(); return; }
    try {
      var session = await Hub.getSession();
      if (!session) { _render(); return; }
      var result = await Hub.db
        .from('notes')
        .select('id,module_id,content')
        .eq('user_id', session.user.id)
        .eq('course_id', COURSE_ID)
        .order('created_at', { ascending: false });
      if (result.error) { Hub.log.error('[Notes] Load failed:', result.error); _render(); return; }
      if (result.data) {
        _notes = result.data.map(function (row) {
          try {
            var p = JSON.parse(row.content);
            return { id: row.id, module_id: row.module_id, topic: p.topic || '', description: p.description || '', observations: p.observations || '' };
          } catch (e) {
            return { id: row.id, module_id: row.module_id, topic: row.module_id, description: row.content, observations: '' };
          }
        });
      }
    } catch (e) {
      Hub.log.error('[Notes] Unexpected load error:', e);
    }
    _render();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _build);
  } else {
    _build();
  }
  window.addEventListener('load', _load);

})();
