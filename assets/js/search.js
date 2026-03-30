/* ============================================================
   Search — Lunr.js full-text search over commands.json
   Requires: Lunr.js loaded before this script
   ============================================================ */
(function (global) {
  'use strict';

  var searchIndex = null;
  var commandsMap = {};

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function difficultyBadge(d) {
    var map = { beginner: 'badge-beginner', intermediate: 'badge-intermediate', advanced: 'badge-advanced' };
    var label = d ? (d.charAt(0).toUpperCase() + d.slice(1)) : '';
    return label ? '<span class="badge ' + (map[d] || '') + '">' + esc(label) + '</span>' : '';
  }

  function installBadge(i) {
    var map = { builtin: ['badge-builtin', 'Built-in'], ssc: ['badge-ssc', 'SSC'], github: ['badge-github', 'GitHub'] };
    var m = map[i] || ['badge-github', i || ''];
    return m[1] ? '<span class="badge ' + m[0] + '">' + esc(m[1]) + '</span>' : '';
  }

  // ── Build Lunr index ──────────────────────────────────────────
  function buildIndex(commands) {
    if (typeof lunr === 'undefined') {
      console.warn('Lunr.js not loaded. Search requires lunr.min.js.');
      return null;
    }
    return lunr(function () {
      this.ref('id');
      this.field('name',         { boost: 10 });
      this.field('full_name',    { boost: 8 });
      this.field('keywords',     { boost: 5 });
      this.field('what_it_does', { boost: 3 });
      this.field('when_to_use',  { boost: 2 });
      this.field('mistake');
      this.field('tags_flat');

      commands.forEach(function (cmd) {
        var c = cmd.content || {};
        this.add({
          id:          cmd.id,
          name:        cmd.name || '',
          full_name:   cmd.full_name || '',
          keywords:    (cmd.tags && cmd.tags.keywords ? cmd.tags.keywords.join(' ') : ''),
          what_it_does: c.what_it_does || '',
          when_to_use: Array.isArray(c.when_to_use) ? c.when_to_use.join(' ') : '',
          mistake:     c.beginner_mistake || '',
          tags_flat:   [
            cmd.category || '',
            cmd.difficulty || '',
            cmd.install || '',
            (cmd.tags && cmd.tags.estimator_type ? cmd.tags.estimator_type.join(' ') : ''),
            (cmd.tags && cmd.tags.data_structure ? cmd.tags.data_structure.join(' ') : '')
          ].join(' ')
        });
      }, this);
    });
  }

  // ── Render search results ─────────────────────────────────────
  function renderResults(query, results, container) {
    if (!query.trim()) {
      container.innerHTML = '';
      return;
    }

    if (!results.length) {
      container.innerHTML = '<div class="callout callout-info"><p>No results found for <strong>' +
        esc(query) + '</strong>. Try different keywords.</p></div>';
      return;
    }

    var html = '<p style="color:#6b7280;font-size:.875rem;margin-bottom:1rem;">Found <strong>' +
      results.length + '</strong> result' + (results.length !== 1 ? 's' : '') + ' for <strong>' +
      esc(query) + '</strong></p>';

    results.forEach(function (r) {
      var cmd = commandsMap[r.ref];
      if (!cmd) return;
      var c = cmd.content || {};
      var snippet = (c.what_it_does || '').slice(0, 120);
      if (c.what_it_does && c.what_it_does.length > 120) snippet += '…';

      html += '<a href="commands/command.html?cmd=' + esc(cmd.id) + '" class="search-result-item" style="text-decoration:none;">' +
        '<div>' +
          '<div class="search-result-cmd">' + esc(cmd.name) + '</div>' +
          '<div style="font-size:.78rem;color:#6b7280;">' + esc(cmd.full_name || '') + '</div>' +
        '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="search-result-desc">' + esc(snippet) + '</div>' +
          '<div class="search-result-meta">' +
            difficultyBadge(cmd.difficulty) +
            installBadge(cmd.install) +
          '</div>' +
        '</div></a>';
    });

    container.innerHTML = html;
  }

  // ── Perform search ────────────────────────────────────────────
  function doSearch(query) {
    if (!searchIndex) return [];
    var clean = query.trim();
    if (!clean) return [];
    try {
      // Try exact first, then wildcard
      var results = searchIndex.search(clean);
      if (!results.length) results = searchIndex.search(clean + '*');
      return results;
    } catch (e) {
      return [];
    }
  }

  // ── Initialize from existing data or fetch ────────────────────
  function loadData(jsonPath, cb) {
    if (window.COMMANDS_DATA) { cb(window.COMMANDS_DATA); return; }
    fetch(jsonPath || 'assets/js/data/commands.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        window.COMMANDS_DATA = data.commands || [];
        cb(window.COMMANDS_DATA);
      })
      .catch(function (e) { console.error('Search: failed to load commands.json', e); });
  }

  // ── Public init ───────────────────────────────────────────────
  function init(opts) {
    opts = opts || {};
    var inputEl   = document.getElementById(opts.inputId   || 'search-input');
    var resultsEl = document.getElementById(opts.resultsId || 'search-results');
    var jsonPath  = opts.jsonPath || 'assets/js/data/commands.json';

    if (!inputEl || !resultsEl) return;

    loadData(jsonPath, function (commands) {
      commands.forEach(function (cmd) { commandsMap[cmd.id] = cmd; });
      searchIndex = buildIndex(commands);

      // Bind input event
      var timer;
      inputEl.addEventListener('input', function () {
        clearTimeout(timer);
        var q = inputEl.value;
        timer = setTimeout(function () {
          renderResults(q, doSearch(q), resultsEl);
        }, 200);
      });

      // Handle pre-filled query (from URL param)
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (q) {
        inputEl.value = q;
        renderResults(q, doSearch(q), resultsEl);
      }
    });
  }

  // ── Full-page search (search.html) ───────────────────────────
  function renderPageResults(query, results, opts) {
    var resultsEl  = document.getElementById(opts.resultsId  || 'search-results');
    var metaEl     = document.getElementById(opts.metaId     || 'search-meta');
    var emptyEl    = document.getElementById(opts.emptyStateId || 'search-empty-state');
    var browseEl   = document.getElementById(opts.browseId   || 'browse-shortcuts');
    if (!resultsEl) return;

    var clean = (query || '').trim();

    // Empty query — show empty state
    if (!clean) {
      if (emptyEl) emptyEl.style.display = '';
      if (browseEl) browseEl.style.display = '';
      if (metaEl) metaEl.textContent = '';
      resultsEl.innerHTML = '';
      return;
    }

    // Hide empty state / browse shortcuts
    if (emptyEl) emptyEl.style.display = 'none';
    if (browseEl) browseEl.style.display = 'none';

    if (metaEl) {
      metaEl.textContent = results.length
        ? 'Found ' + results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + clean + '"'
        : 'No results for "' + clean + '"';
    }

    if (!results.length) {
      resultsEl.innerHTML = '<div class="callout callout-info"><p>No results found for <strong>' +
        esc(clean) + '</strong>.</p><p>Try: shorter keywords, command name, or browse categories below.</p></div>';
      if (browseEl) browseEl.style.display = '';
      return;
    }

    var html = '';
    results.forEach(function (r) {
      var cmd = commandsMap[r.ref];
      if (!cmd) return;
      var c = cmd.content || {};
      var snippet = (c.what_it_does || '').slice(0, 150);
      if ((c.what_it_does || '').length > 150) snippet += '…';
      var kw = (cmd.tags && cmd.tags.keywords) ? cmd.tags.keywords.slice(0, 4) : [];

      html += '<div class="result-item">' +
        '<a class="result-name" href="commands/command.html?cmd=' + esc(cmd.id) + '">' + esc(cmd.name) + '</a>' +
        '<div class="result-title">' + esc(cmd.full_name || '') + '</div>' +
        '<div class="result-excerpt">' + esc(snippet) + '</div>' +
        '<div class="result-tags">' +
          difficultyBadge(cmd.difficulty) +
          installBadge(cmd.install) +
          kw.map(function (k) { return '<span class="tag-pill">' + esc(k) + '</span>'; }).join('') +
        '</div>' +
        '</div>';
    });

    resultsEl.innerHTML = html;
  }

  function initPageSearch(opts) {
    opts = opts || {};
    var inputEl  = document.getElementById(opts.inputId || 'search-page-input');
    var jsonPath = opts.commandsPath || 'assets/js/data/commands.json';
    if (!inputEl) return;

    loadData(jsonPath, function (commands) {
      commands.forEach(function (cmd) { commandsMap[cmd.id] = cmd; });
      searchIndex = buildIndex(commands);

      var timer;
      inputEl.addEventListener('input', function () {
        clearTimeout(timer);
        var q = inputEl.value;
        timer = setTimeout(function () {
          renderPageResults(q, q.trim() ? doSearch(q) : [], opts);
        }, 200);
      });
    });
  }

  // ── Quick search redirect (from nav bar) ─────────────────────
  function initNavSearch(btnId) {
    var btn = document.getElementById(btnId || 'nav-search-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var promptText = (window.StataI18n && typeof window.StataI18n.t === 'function')
        ? window.StataI18n.t('Search Stata commands:')
        : 'Search Stata commands:';
      var q = prompt(promptText);
      if (!q) return;
      q = q.trim();
      if (!q) return;

      var path = (window.location.pathname || '').replace(/\\/g, '/');
      var nested = /\/(commands|categories|comparisons)\//.test(path);
      var searchPath = nested ? '../search.html' : 'search.html';
      window.location.href = searchPath + '?q=' + encodeURIComponent(q);
    });
  }

  global.StataSearch = { init: init, initNavSearch: initNavSearch, initPageSearch: initPageSearch };

})(window);
