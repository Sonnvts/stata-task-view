/* ============================================================
   Template Engine — Renders command pages as LMS Lessons
   Usage: window.CommandPage.render(cmdId, rootElement)
   ============================================================ */
(function (global) {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────────
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function difficultyBadge(d) {
    const map = {
      beginner: { class: 'badge-beginner', label: 'Cơ bản' },
      intermediate: { class: 'badge-intermediate', label: 'Trung cấp' },
      advanced: { class: 'badge-advanced', label: 'Nâng cao' }
    };
    const item = map[d] || { class: 'badge-intermediate', label: 'Trung cấp' };
    return `<span class="badge ${item.class}">${esc(item.label)}</span>`;
  }

  function installBadge(install) {
    const map = { builtin: ['badge-builtin', 'Có sẵn'], ssc: ['badge-ssc', 'SSC'], github: ['badge-github', 'GitHub'] };
    const m = map[install] || ['badge-github', install || 'Khác'];
    return '<span class="badge ' + m[0] + '">' + esc(m[1]) + '</span>';
  }

  function tagPills(tags) {
    if (!tags || !tags.keywords) return '';
    return tags.keywords.slice(0, 6).map(function (t) {
      return '<span class="tag-pill">' + esc(t) + '</span>';
    }).join('');
  }

  function listItems(arr) {
    if (!arr || !arr.length) return '<li>N/A</li>';
    return arr.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('');
  }

  function codeBlock(syntax) {
    if (!syntax || !syntax.code) return '';
    return '<div class="code-wrapper"><pre class="language-stata"><code>' +
      esc(syntax.code) + '</code></pre>' +
      '<button class="copy-btn" aria-label="Copy code">Sao chép</button></div>';
  }

  function sectionHeader(n, title) {
    return `<h2><span class="section-num">${n}</span> ${title}</h2>`;
  }

  // ── LMS Syllabus Sidebar ─────────────────────────────────────
  function renderSyllabus(cmd, allCommands) {
    const syllabusRoot = document.getElementById('syllabus-root');
    if (!syllabusRoot || !cmd.category) return;

    // Find all commands in the same category
    const categoryCommands = allCommands.filter(c => c.category === cmd.category);

    let html = '<ul class="sidebar-syllabus">';
    categoryCommands.forEach(c => {
      const activeClass = c.id === cmd.id ? 'active' : '';
      html += `<li class="syllabus-item ${activeClass}">
        <a href="command.html?cmd=${esc(c.id)}">${esc(c.name)}</a>
      </li>`;
    });
    html += '</ul>';

    syllabusRoot.innerHTML = html;
  }

  // ── Progress Bar Logic ───────────────────────────────────────
  function initProgressBar() {
    const progressBar = document.getElementById('lms-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    });
  }

  // ── Main render function ─────────────────────────────────────
  function renderCommand(cmd, root, allCommands) {
    if (!cmd || !cmd.content) {
      root.innerHTML = '<div class="callout callout-danger"><div class="callout-title">Lỗi</div><p>Không tìm thấy dữ liệu lệnh.</p></div>';
      return;
    }
    var c = cmd.content;

    // Update page title
    document.title = esc(cmd.name) + ' — Bài học Stata';

    // Breadcrumb (Vietnamese)
    var catHref = '../categories/' + esc(cmd.category) + '.html';
    var catLabel = cmd.category.replace(/-/g, ' ');

    var html = '';

    // HEADER
    html += `<nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../index.html">Trang chủ</a><span class="breadcrumb-sep">›</span>
      <a href="${catHref}">Danh mục</a><span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${esc(cmd.name)}</span></nav>`;

    html += `<div class="cmd-page-header">
      <div class="topic-label">Bài học thực hành</div>
      <div class="cmd-name text-layer" data-text="${esc(cmd.name)}">${esc(cmd.name)}</div>
      <div class="cmd-full-name">${esc(cmd.full_name || '')}</div>
      <div class="cmd-meta-row">
        ${difficultyBadge(cmd.difficulty)}
        ${installBadge(cmd.install)}
        ${tagPills(cmd.tags)}
      </div>
    </div>`;

    // 1. What it does
    html += `<section class="cmd-section" id="what-it-does">
      ${sectionHeader(1, 'Lệnh này làm gì?')}
      <p>${esc(c.what_it_does)}</p>
    </section>`;

    // 2. Problem
    html += `<section class="cmd-section" id="problem">
      ${sectionHeader(2, 'Vấn đề thực tế cần giải quyết')}
      <p>${esc(c.problem_it_solves)}</p>
    </section>`;

    // 3. Algorithm
    html += `<section class="cmd-section" id="algorithm">
      ${sectionHeader(3, 'Mô hình hoặc thuật toán đằng sau')}
      <p>${esc(c.algorithm)}</p>
    </section>`;

    // 4. When to use
    html += `<section class="cmd-section" id="when-to-use">
      ${sectionHeader(4, 'Khi nào nên sử dụng? Khi nào nên tránh?')}
      <div class="use-columns">
        <div class="use-col use-yes"><h4>✓ Nên dùng khi</h4><ul>${listItems(c.when_to_use)}</ul></div>
        <div class="use-col use-no"><h4>✗ Tránh dùng khi</h4><ul>${listItems(c.when_not_to_use)}</ul></div>
      </div>
    </section>`;

    // 5. Assumptions
    html += `<section class="cmd-section" id="assumptions">
      ${sectionHeader(5, 'Các giả định quan trọng')}
      <ul>${listItems(c.key_assumptions)}</ul>
    </section>`;

    // 6. Output
    html += `<section class="cmd-section" id="output">
      ${sectionHeader(6, 'Kết quả cần ưu tiên đọc trước')}
      <div class="callout callout-info"><div class="callout-title">📊 Chỉ số quan trọng</div><p>${esc(c.output_read_first)}</p></div>
    </section>`;

    // 7. Mistake
    html += `<section class="cmd-section" id="mistake">
      ${sectionHeader(7, 'Sai lầm phổ biến của người mới')}
      <div class="callout callout-danger"><div class="callout-title">⚠ Cảnh báo</div><p>${esc(c.beginner_mistake)}</p></div>
    </section>`;

    // 8. Basic syntax
    html += `<section class="cmd-section" id="basic-syntax">
      ${sectionHeader(8, 'Ví dụ cú pháp cơ bản')}
      ${codeBlock(c.basic_syntax)}
    </section>`;

    // 9. Advanced
    if (c.advanced_syntax && c.advanced_syntax.code) {
      html += `<section class="cmd-section" id="advanced-syntax">
        ${sectionHeader(9, 'Ứng dụng nâng cao')}
        <p class="section-note">${esc(c.advanced_syntax.description || '')}</p>
        ${codeBlock(c.advanced_syntax)}
      </section>`;
    }

    // 10. Recommendation
    html += `<section class="cmd-section" id="recommendation">
      ${sectionHeader(10, 'Giải pháp thay thế & Lời khuyên thực tế')}
      ${c.advanced_alternative && c.advanced_alternative.command ? `
        <div class="upgrade-block">
          <h4>🚀 Khi nào nên nâng cấp</h4>
          <p><strong>${esc(c.advanced_alternative.command)}</strong> 
          (${installBadge(c.advanced_alternative.install)}): ${esc(c.advanced_alternative.reason)}</p>
        </div>` : ''}
      <div class="verdict-box" style="margin-top:1rem;">
        <div class="verdict-label">Lời khuyên từ chuyên gia</div>
        <p>${esc(c.practical_recommendation)}</p>
      </div>
    </section>`;

    // QUIZ Placeholder
    html += `<section class="cmd-section" id="quiz">
      <div class="quiz-box">
        <div class="quiz-title">📝 Bài tập tự kiểm tra</div>
        <p>Thực hành cú pháp trên với bộ dữ liệu của bạn và so sánh kết quả với các chẩn đoán đã nêu ở Phần 6 (Kết quả cần đọc).</p>
      </div>
    </section>`;

    // RELATED
    if (cmd.related_commands && cmd.related_commands.length) {
      html += `<section class="cmd-section" id="related">
        <h3 class="accent-bar">Lệnh liên quan</h3>
        <div class="tags-row">${cmd.related_commands.map(r => `<a href="command.html?cmd=${esc(r)}" class="tag-pill">${esc(r)}</a>`).join('')}</div>
      </section>`;
    }

    root.innerHTML = html;
    renderSyllabus(cmd, allCommands);
    initProgressBar();

    // Re-init copy buttons
    root.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pre = btn.previousElementSibling;
        navigator.clipboard.writeText(pre.innerText).then(() => {
          btn.textContent = 'Đã chép!';
          setTimeout(() => { btn.textContent = 'Sao chép'; }, 2000);
        });
      });
    });
  }

  // ── Load and Render ──────────────────────────────────────────
  function loadAndRender(cmdId, root) {
    var jsonPath = '../assets/js/data/commands.json';

    fetch(jsonPath)
      .then(r => r.json())
      .then(data => {
        const allCommands = data.commands || [];
        const cmd = allCommands.find(c => c.id === cmdId);
        renderCommand(cmd, root, allCommands);
      })
      .catch(err => {
        root.innerHTML = '<p>Không thể tải dữ liệu: ' + err.message + '</p>';
      });
  }

  global.CommandPage = {
    renderFromUrl: function (root) {
      var params = new URLSearchParams(window.location.search);
      var cmdId = params.get('cmd') || '';
      loadAndRender(cmdId, root);
    }
  };

})(window);
