/* ============================================================
   Decision Tree — Step-by-step interactive command recommender
   Reads decision-tree.json and renders card-based UI
   ============================================================ */
(function (global) {
  'use strict';

  var treeData = null;
  var history  = [];   // Stack of node IDs (breadcrumb + back)
  var container = null;

  // ── Helpers ──────────────────────────────────────────────────
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  // ── Render breadcrumb from history ───────────────────────────
  function renderBreadcrumb() {
    if (history.length <= 1) return '';
    var parts = history.slice(0, -1).map(function (nodeId) {
      var node = treeData.nodes[nodeId];
      if (!node || node.type !== 'question') return null;
      // Find the choice label that led to the next step
      var nextIdx = history.indexOf(nodeId);
      var nextId = history[nextIdx + 1];
      var choiceLabel = '';
      if (node.choices) {
        node.choices.forEach(function (ch) {
          if (ch.next === nextId) choiceLabel = ch.label;
        });
      }
      return choiceLabel || null;
    }).filter(Boolean);

    if (!parts.length) return '';
    return '<div class="decision-breadcrumb" aria-label="Path so far">' +
      parts.map(function (p) {
        return '<span class="decision-breadcrumb-item">' + esc(p.length > 32 ? p.slice(0, 30) + '…' : p) + '</span>';
      }).join('') + '</div>';
  }

  // ── Render a question node ────────────────────────────────────
  function renderQuestion(node) {
    var progressText = history.length > 1
      ? 'Step ' + history.length
      : 'Start';

    var choicesHtml = node.choices.map(function (ch) {
      return '<button class="decision-choice-btn" data-next="' + esc(ch.next) + '">' +
        esc(ch.label) + '</button>';
    }).join('');

    var backBtn = history.length > 1
      ? '<button class="decision-back-btn" id="dt-back">← Back</button>'
      : '';

    return '<div class="decision-node">' +
      '<div class="decision-progress">' + esc(progressText) + '</div>' +
      renderBreadcrumb() +
      '<div class="decision-question">' + esc(node.text) + '</div>' +
      (node.help ? '<div class="decision-help">' + esc(node.help) + '</div>' : '') +
      '<div class="decision-choices">' + choicesHtml + '</div>' +
      '<div class="decision-footer">' +
        backBtn +
        '<button class="decision-restart-btn" id="dt-restart">↩ Start over</button>' +
      '</div></div>';
  }

  // ── Render a terminal (recommendation) node ──────────────────
  function renderTerminal(node) {
    var cmdPath = '../commands/command.html?cmd=' + esc(node.command_id || '');
    var compPath = node.comparison_page ? '../comparisons/' + esc(node.comparison_page) + '.html' : null;

    var alsoSeeHtml = '';
    if (node.also_see && node.also_see.length) {
      alsoSeeHtml = '<p style="font-size:.8rem;color:#6b7280;margin-top:.5rem;">Also consider: ' +
        node.also_see.map(function (id) {
          return '<a href="../commands/command.html?cmd=' + esc(id) + '" style="font-family:var(--font-mono)">' + esc(id) + '</a>';
        }).join(' &nbsp;|&nbsp; ') + '</p>';
    }

    var warningHtml = node.warning
      ? '<div class="callout callout-warning" style="margin:1rem 0;text-align:left;"><div class="callout-title">⚠ Important</div><p>' + esc(node.warning) + '</p></div>'
      : '';

    return '<div class="decision-node">' +
      renderBreadcrumb() +
      '<div class="decision-terminal">' +
        '<div class="terminal-label">Recommended command</div>' +
        '<div class="terminal-cmd">' + esc(node.name || node.command_id) + '</div>' +
        '<div class="terminal-badges">' +
          difficultyBadge(node.difficulty) +
          installBadge(node.install) +
        '</div>' +
        '<div class="terminal-rationale">' + esc(node.rationale || '') + '</div>' +
        warningHtml +
        alsoSeeHtml +
        '<div class="terminal-actions">' +
          '<a href="' + cmdPath + '" class="btn-primary">Full command guide →</a>' +
          (compPath ? '<a href="' + compPath + '" class="btn-secondary">Compare options</a>' : '') +
        '</div>' +
      '</div>' +
      '<div class="decision-footer" style="justify-content:center;margin-top:1rem;">' +
        '<button class="decision-back-btn" id="dt-back">← Back</button>' +
        '<button class="decision-restart-btn" id="dt-restart">↩ Start over</button>' +
      '</div>' +
    '</div>';
  }

  // ── Render current node ───────────────────────────────────────
  function renderNode(nodeId) {
    var node = treeData.nodes[nodeId];
    if (!node) {
      container.innerHTML = '<div class="callout callout-danger"><p>Tree node not found: ' + esc(nodeId) + '</p></div>';
      return;
    }

    var html = node.type === 'terminal' ? renderTerminal(node) : renderQuestion(node);

    // Fade transition
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.15s';
    setTimeout(function () {
      container.innerHTML = html;
      container.style.opacity = '1';
      bindEvents();
    }, 150);
  }

  // ── Bind click events ─────────────────────────────────────────
  function bindEvents() {
    // Choice buttons
    container.querySelectorAll('.decision-choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = this.getAttribute('data-next');
        if (next) {
          history.push(next);
          renderNode(next);
        }
      });
    });

    // Back button
    var backBtn = container.querySelector('#dt-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (history.length > 1) {
          history.pop();
          renderNode(history[history.length - 1]);
        }
      });
    }

    // Restart button
    var restartBtn = container.querySelector('#dt-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        history = [treeData.start];
        renderNode(treeData.start);
      });
    }
  }

  // ── Initialize ────────────────────────────────────────────────
  function init(mountId, jsonPath) {
    container = document.getElementById(mountId);
    if (!container) return;

    jsonPath = jsonPath || 'assets/js/data/decision-tree.json';

    // Loading state
    container.innerHTML = '<div class="callout callout-info"><p>Loading decision tree…</p></div>';

    fetch(jsonPath)
      .then(function (r) {
        if (!r.ok) throw new Error('Could not load decision-tree.json');
        return r.json();
      })
      .then(function (data) {
        treeData = data;
        history = [data.start];
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.2s';
        setTimeout(function () {
          renderNode(data.start);
          container.style.opacity = '1';
        }, 50);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="callout callout-danger"><div class="callout-title">Error</div>' +
          '<p>' + esc(err.message) + '</p>' +
          '<p>Ensure you are serving via a local web server (e.g., VS Code Live Server).</p></div>';
      });
  }

  // ── Public API ────────────────────────────────────────────────
  global.DecisionTree = { init: init };

})(window);
