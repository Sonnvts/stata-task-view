/* ============================================================
   Filter — Tag/category filtering for category pages
   ============================================================ */
(function (global) {
  'use strict';

  // ── Public API ────────────────────────────────────────────────
  function initCategoryFilter(opts) {
    opts = opts || {};
    var gridEl  = document.getElementById(opts.gridId  || 'cmd-grid');
    var countEl = document.getElementById(opts.countId || 'filter-count');
    var clearEl = document.getElementById(opts.clearId || 'filter-clear');

    if (!gridEl) return;

    var cards = Array.from(gridEl.querySelectorAll('[data-tags]'));

    function getFilters() {
      var filters = {};
      document.querySelectorAll('.filter-select').forEach(function (sel) {
        var key = sel.getAttribute('data-filter-key');
        var val = sel.value;
        if (key && val && val !== 'all') filters[key] = val;
      });
      return filters;
    }

    function applyFilters() {
      var filters = getFilters();
      var visible = 0;

      cards.forEach(function (card) {
        var tagsRaw = card.getAttribute('data-tags') || '';
        var tags;
        try { tags = JSON.parse(tagsRaw); } catch (e) { tags = {}; }

        var show = Object.keys(filters).every(function (key) {
          var filterVal = filters[key];
          var tagVal = tags[key];
          if (Array.isArray(tagVal)) {
            return tagVal.indexOf(filterVal) !== -1;
          }
          return String(tagVal) === String(filterVal);
        });

        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visible + ' of ' + cards.length + ' commands';
      }
    }

    // Bind filter selects
    document.querySelectorAll('.filter-select').forEach(function (sel) {
      sel.addEventListener('change', applyFilters);
    });

    // Clear button
    if (clearEl) {
      clearEl.addEventListener('click', function () {
        document.querySelectorAll('.filter-select').forEach(function (sel) { sel.value = 'all'; });
        applyFilters();
      });
    }

    // Initial count
    if (countEl) countEl.textContent = 'Showing ' + cards.length + ' of ' + cards.length + ' commands';
  }

  global.StataFilter = { initCategoryFilter: initCategoryFilter };

})(window);
