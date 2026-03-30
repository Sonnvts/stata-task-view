/* ============================================================
   Navigation + I18N — nav behaviors and EN/VI interface toggle
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'stata_lang';
  var SUPPORTED_LANGS = { en: true, vi: true };
  var currentLang = 'vi';
  var translationObserver = null;
  var translationTimer = null;
  var pendingTranslationRoots = new Set();
  var isApplyingTranslation = false;

  var textOriginalMap = new WeakMap();
  var attrOriginalMap = new WeakMap();

  var EXACT_VI_EN = {
    'Trang chủ': 'Home',
    'Danh mục': 'Categories',
    'Danh mục ▾': 'Categories ▾',
    'So sánh': 'Comparisons',
    'So sánh ▾': 'Comparisons ▾',
    'Cây quyết định': 'Decision Tree',
    'Gói tốt nhất': 'Best Packages',
    'Tìm kiếm': 'Search',
    'Công cụ': 'Tools',
    'Liên quan': 'Related',
    'Giới thiệu': 'About',
    'Tất cả so sánh': 'All Comparisons',
    'Tất cả so sánh →': 'All comparisons →',
    'Sai lầm phổ biến': 'Common Mistakes',
    'Phân loại gói': 'Package Taxonomy',
    'Lộ trình nghiên cứu': 'Research Roadmap',
    'Mở lộ trình →': 'Open roadmap →',
    'So sánh lệnh': 'Compare commands',
    'Cách sử dụng công cụ này': 'How to use this tool',
    'Cách sử dụng hướng dẫn này': 'How to use this guide',
    'Sơ đồ tham khảo nhanh': 'Quick reference flow',
    'Hiển thị hướng dẫn dạng văn bản (phiên bản tĩnh)': 'Show text-based guide (static version)',
    'Bắt đầu lại': 'Start over',
    'Bắt đầu nhập để tìm kiếm': 'Start typing to search',
    'Các kết quả tìm kiếm phổ biến:': 'Popular searches:',
    'Duyệt theo danh mục': 'Browse by category',
    'Tìm kiếm các lệnh & Hướng dẫn': 'Search Commands & Guides',
    'Tôi nên sử dụng lệnh Stata nào?': 'Which Stata Command Should I Use?',
    'Tất cả so sánh lệnh': 'All Command Comparisons',
    'Gói tốt nhất theo trường hợp sử dụng': 'Best Package by Use Case',
    'Phân loại gói Stata': 'Stata Package Taxonomy',
    'Tìm kiếm trong tất cả 46+ lệnh, so sánh và hướng dẫn danh mục': 'Search across all 46+ commands, comparisons, and category guides',
    'Đang tải…': 'Loading…',
    'Đang tải...': 'Loading...',
    'Đang tải cây quyết định...': 'Loading decision tree…',
    'Không tìm thấy kết quả cho': 'No results found for',
    'Điều hướng chính': 'Main navigation',
    'Bật/tắt menu': 'Toggle menu',
    'Tìm kiếm lệnh Stata:': 'Search Stata commands:',
    'Mục nội dung': 'Sections',
    'Thao tác nhanh': 'Quick actions',
    '1. Chức năng': '1. What it does',
    '2. Vấn đề giải quyết': '2. Problem solved',
    '3. Mô hình / Thuật toán': '3. Algorithm',
    '4. Khi nên dùng / tránh': '4. When to use / avoid',
    '5. Giả định chính': '5. Key assumptions',
    '6. Output cần đọc trước': '6. Output to read first',
    '7. Lỗi thường gặp': '7. Common mistake',
    '8. Cú pháp cơ bản': '8. Basic syntax',
    '9. Sử dụng nâng cao': '9. Advanced usage',
    '10. Khuyến nghị': '10. Recommendation',
    '← Cây quyết định': '← Decision Tree',
    '🖨 In bài học này': '🖨 Print this page',
    'Đang tải dữ liệu bài học. Vui lòng đợi trong giây lát.': 'Fetching command data. Please wait a moment.',
    'Lệnh này làm gì?': 'What does this command do?',
    'Vấn đề thực tế cần giải quyết': 'What problem does it solve?',
    'Mô hình hoặc thuật toán đằng sau': 'What model / algorithm is behind it?',
    'Khi nào nên sử dụng? Khi nào nên tránh?': 'When should I use it? When should I avoid it?',
    'Các giả định quan trọng': 'Key assumptions',
    'Kết quả cần ưu tiên đọc trước': 'What output should I read first?',
    'Sai lầm phổ biến của người mới': 'Common beginner mistake',
    'Ví dụ cú pháp cơ bản': 'Basic syntax example',
    'Ứng dụng nâng cao': 'Advanced usage',
    'Giải pháp thay thế & Lời khuyên thực tế': 'Advanced alternative & practical recommendation',
    'Lời khuyên thực tế': 'Practical recommendation',
    'Lệnh liên quan': 'Related commands',
    'So sánh với lệnh tương tự': 'Compare with similar commands',
    'Chỉ số quan trọng': 'Priority output',
    'Cảnh báo': 'Watch out for this',
    'Khi nào nên nâng cấp': 'When to upgrade',
    'Lỗi': 'Error',
    'Không tìm thấy dữ liệu lệnh.': 'Command data not found.',
    'Chưa chỉ định lệnh': 'No command specified',
    'Hãy dùng URL dạng command.html?cmd=reg.': 'Please use a URL like command.html?cmd=reg.',
    'Không tải được dữ liệu': 'Failed to load data',
    'Hãy mở website qua web server hoặc dùng Live Server trong VS Code.': 'Make sure you are opening the file through a web server or use the Live Server extension in VS Code.',
    'Lệnh đề xuất': 'Recommended command',
    'Cân nhắc thêm:': 'Also consider:',
    'Lưu ý quan trọng': 'Important',
    'Hướng dẫn chi tiết →': 'Full command guide →',
    'So sánh lựa chọn': 'Compare options',
    '← Quay lại': '← Back',
    '↩ Bắt đầu lại': '↩ Start over',
    'Bắt đầu': 'Start',
    'Đang hiển thị': 'Showing',
    'lệnh': 'commands',
    'Tìm kiếm… vd: panel, DID so le, công cụ yếu': 'Search… e.g. panel, staggered DID, weak instruments',
    'Thử từ khóa khác.': 'Try different keywords.',
    'Tìm thấy': 'Found',
    'kết quả': 'results',
    'cho': 'for',
    'Tìm kiếm theo tên lệnh, mô tả, trường hợp sử dụng và các sai lầm phổ biến.': 'Search across command names, descriptions, use cases, and common mistakes.',
    'Duyệt theo nhiệm vụ kinh tế lượng': 'Browse by econometric task',
    'Các so sánh quan trọng nhất': 'Most important comparisons',
    'Stata Kinh Tế Lượng Task View': 'Stata Econometrics Task View',
    'Tài nguyên học thuật cho kinh tế lượng ứng dụng': 'Educational resource for applied econometrics',
    'Hướng dẫn Lệnh — Stata Kinh tế lượng Task View': 'Command Guide — Stata Econometrics Task View',
    'Tìm kiếm — Stata Econometrics Task View': 'Search — Stata Econometrics Task View',
    'Cây Quyết Định Chọn Lệnh — Stata Econometrics Task View': 'Decision Tree — Stata Econometrics Task View',
    'Tất cả so sánh — Stata Econometrics Task View': 'All Comparisons — Stata Econometrics Task View',
    'Gói tốt nhất — Stata Kinh tế lượng Task View': 'Best Packages — Stata Econometrics Task View',
    'Phân loại gói — Stata Econometrics Task View': 'Package Taxonomy — Stata Econometrics Task View',
    'OLS & Kiểm định': 'OLS & Diagnostics',
    'Biến phụ thuộc giới hạn': 'Limited Dependent Variables',
    'Dữ liệu bảng': 'Panel Data',
    'Biến công cụ & Nội sinh': 'IV & Endogeneity',
    'Chuỗi thời gian': 'Time Series',
    'Suy diễn nhân quả': 'Causal Inference',
    'DID theo giai đoạn': 'Staggered DID',
    'Kinh tế lượng ML': 'ML Econometrics',
    'Kinh tế lượng hỗ trợ ML': 'ML-Assisted Econometrics',
    'Tổng quan': 'Overview',
    'Tra cứu nhanh': 'Quick reference',
    'Bước 1: Loại biến phụ thuộc của bạn là gì?': 'Step 1: What is your outcome variable type?',
    'Bước 2: Mục tiêu nghiên cứu chính của bạn là gì?': 'Step 2: What is your primary research goal?',
    'Bước 3: Định danh nhân quả — thiết kế của bạn là gì?': 'Step 3: Causal identification — what is your design?',
    'Bước 4: OLS / Hồi quy — cấu trúc dữ liệu của bạn là gì?': 'Step 4: OLS / Regression — what is your data structure?',
    'Bước 5: Chuỗi thời gian — chuỗi đơn hay nhiều chuỗi?': 'Step 5: Time series — single or multiple series?',
    'Sao chép': 'Copy',
    'Đã chép!': 'Copied!',
    'Đang tải danh sách bài học...': 'Loading lesson list...'
  };

  var EXACT_EN_VI = {};
  Object.keys(EXACT_VI_EN).forEach(function (vi) {
    EXACT_EN_VI[EXACT_VI_EN[vi]] = vi;
  });

  var PARTIAL_VI_EN = [
    ['Stata Kinh Tế Lượng Task View', 'Stata Econometrics Task View'],
    ['Stata Kinh tế lượng Task View', 'Stata Econometrics Task View'],
    ['Stata Econometrics Task View — Bản tiếng Việt', 'Stata Econometrics Task View — Vietnamese Edition'],
    ['Tài nguyên giáo dục cho kinh tế lượng ứng dụng', 'Educational resource for applied econometrics'],
    ['Tài nguyên học thuật cho kinh tế lượng ứng dụng', 'Academic resource for applied econometrics'],
    ['kết quả cần đọc', 'output to read first'],
    ['Kết quả cần đọc', 'Output to read first'],
    ['bài học thực hành', 'practical lesson'],
    ['Bài học thực hành', 'Practical Lesson'],
    ['kinh tế lượng', 'econometrics'],
    ['Kinh tế lượng', 'Econometrics'],
    ['suy diễn nhân quả', 'causal inference'],
    ['Suy diễn nhân quả', 'Causal Inference'],
    ['dữ liệu bảng', 'panel data'],
    ['Dữ liệu bảng', 'Panel Data'],
    ['biến công cụ', 'instrumental variables'],
    ['Biến công cụ', 'Instrumental Variables'],
    ['nội sinh', 'endogeneity'],
    ['Nội sinh', 'Endogeneity'],
    ['hiệu ứng cố định', 'fixed effects'],
    ['Hiệu ứng cố định', 'Fixed Effects'],
    ['hiệu ứng ngẫu nhiên', 'random effects'],
    ['Hiệu ứng ngẫu nhiên', 'Random Effects'],
    ['sai số chuẩn vững', 'robust standard errors'],
    ['Sai số chuẩn vững', 'Robust Standard Errors'],
    ['sai số chuẩn phân cụm', 'clustered standard errors'],
    ['Sai số chuẩn phân cụm', 'Clustered Standard Errors'],
    ['kiểm định Hausman', 'Hausman test'],
    ['Kiểm định Hausman', 'Hausman Test'],
    ['chẩn đoán', 'diagnostics'],
    ['Chẩn đoán', 'Diagnostics'],
    ['giả định', 'assumptions'],
    ['Giả định', 'Assumptions'],
    ['khuyến nghị', 'recommendation'],
    ['Khuyến nghị', 'Recommendation']
  ].sort(function (a, b) {
    return b[0].length - a[0].length;
  });

  var PARTIAL_EN_VI = PARTIAL_VI_EN.map(function (pair) {
    return [pair[1], pair[0]];
  }).sort(function (a, b) {
    return b[0].length - a[0].length;
  });

  var INSTITUTION_LABEL = {
    vi: 'Stata Econometrics Task View · Được tạo bởi Khoa Tài chính - Ngân hàng UEH Mekong',
    en: 'Stata Econometrics Task View · Created by UEH Mekong Faculty of Finance and Banking'
  };

  function getNavigationScript() {
    var script = document.currentScript;
    if (script && /assets\/js\/navigation\.js/.test(script.getAttribute('src') || '')) return script;
    return document.querySelector('script[src*="assets/js/navigation.js"]');
  }

  function getLogoSrc() {
    var script = getNavigationScript();
    if (script && script.src) {
      try {
        return new URL('../images/ueh-fb-logo.png', script.src).href;
      } catch (e) {}
    }
    return 'assets/images/ueh-fb-logo.png';
  }

  function splitJoinAll(str, find, replacement) {
    if (!find) return str;
    return String(str).split(find).join(replacement);
  }

  function getLanguageFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromUrl = params.get('lang');
      if (fromUrl && SUPPORTED_LANGS[fromUrl]) return fromUrl;
    } catch (e) {
      return null;
    }
    return null;
  }

  function getStoredLanguage() {
    var fromUrl = getLanguageFromUrl();
    if (fromUrl) {
      try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch (e) {}
      return fromUrl;
    }
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS[stored]) return stored;
    } catch (e) {}
    var docLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return docLang === 'en' ? 'en' : 'vi';
  }

  function setStoredLanguage(lang) {
    if (!SUPPORTED_LANGS[lang]) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function translateExact(text, targetLang) {
    if (!text) return text;
    if (targetLang === 'vi' && EXACT_EN_VI[text]) return EXACT_EN_VI[text];
    if (targetLang === 'en' && EXACT_VI_EN[text]) return EXACT_VI_EN[text];
    return null;
  }

  function translateRegex(text, targetLang) {
    var s = String(text || '');
    var m;

    if (targetLang === 'vi') {
      m = s.match(/^Step\s+(\d+)$/);
      if (m) return 'Bước ' + m[1];

      m = s.match(/^Found\s+(\d+)\s+results?\s+for\s+"([\s\S]+)"$/);
      if (m) return 'Tìm thấy ' + m[1] + ' kết quả cho "' + m[2] + '"';

      m = s.match(/^No results for\s+"([\s\S]+)"$/);
      if (m) return 'Không có kết quả cho "' + m[1] + '"';

      m = s.match(/^Showing\s+(\d+)\s+of\s+(\d+)\s+commands$/);
      if (m) return 'Đang hiển thị ' + m[1] + ' / ' + m[2] + ' lệnh';
    }

    if (targetLang === 'en') {
      m = s.match(/^Bước\s+(\d+)$/);
      if (m) return 'Step ' + m[1];

      m = s.match(/^Tìm thấy\s+(\d+)\s+kết quả\s+cho\s+"([\s\S]+)"$/);
      if (m) return 'Found ' + m[1] + ' results for "' + m[2] + '"';

      m = s.match(/^Không có kết quả cho\s+"([\s\S]+)"$/);
      if (m) return 'No results for "' + m[1] + '"';

      m = s.match(/^Đang hiển thị\s+(\d+)\s*\/\s*(\d+)\s+lệnh$/);
      if (m) return 'Showing ' + m[1] + ' of ' + m[2] + ' commands';
    }

    return null;
  }

  function translateByPartials(text, targetLang) {
    var out = String(text || '');
    var pairs = targetLang === 'vi' ? PARTIAL_EN_VI : PARTIAL_VI_EN;
    pairs.forEach(function (pair) {
      out = splitJoinAll(out, pair[0], pair[1]);
    });
    return out;
  }

  function translateToVietnamese(text) {
    var raw = String(text || '');
    if (!raw.trim()) return raw;

    var lead = (raw.match(/^\s*/) || [''])[0];
    var trail = (raw.match(/\s*$/) || [''])[0];
    var core = raw.trim();

    var exact = translateExact(core, 'vi');
    if (exact) return lead + exact + trail;

    var reg = translateRegex(core, 'vi');
    if (reg) return lead + reg + trail;

    var partial = translateByPartials(core, 'vi');
    return lead + partial + trail;
  }

  function translateToEnglish(text) {
    var raw = String(text || '');
    if (!raw.trim()) return raw;

    var lead = (raw.match(/^\s*/) || [''])[0];
    var trail = (raw.match(/\s*$/) || [''])[0];
    var core = raw.trim();

    var exact = translateExact(core, 'en');
    if (exact) return lead + exact + trail;

    var reg = translateRegex(core, 'en');
    if (reg) return lead + reg + trail;

    var partial = translateByPartials(core, 'en');
    return lead + partial + trail;
  }

  function translateText(text, lang) {
    if (lang === 'vi') return translateToVietnamese(text);
    if (lang === 'en') return translateToEnglish(text);
    return String(text || '');
  }

  function shouldSkipTextNode(node) {
    if (!node || !node.parentElement) return true;
    var parent = node.parentElement;
    if (parent.closest('[data-i18n-skip="true"]')) return true;
    if (parent.closest('script, style, pre, code, textarea, svg, math')) return true;
    return false;
  }

  function getAttrStore(el) {
    var store = attrOriginalMap.get(el);
    if (!store) {
      store = {};
      attrOriginalMap.set(el, store);
    }
    return store;
  }

  function translateTextNode(node, lang) {
    if (shouldSkipTextNode(node)) return;
    if (!textOriginalMap.has(node)) {
      textOriginalMap.set(node, node.nodeValue || '');
    }
    var original = textOriginalMap.get(node) || '';
    var translated = translateText(original, lang);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function translateElementAttrs(el, lang) {
    if (!el || el.nodeType !== 1) return;
    if (el.closest('[data-i18n-skip="true"]')) return;

    var attrs = ['placeholder', 'title', 'aria-label'];
    var store = getAttrStore(el);

    attrs.forEach(function (attr) {
      if (!el.hasAttribute(attr)) return;
      if (!(attr in store)) store[attr] = el.getAttribute(attr) || '';
      var original = store[attr] || '';
      var translated = translateText(original, lang);
      if (el.getAttribute(attr) !== translated) el.setAttribute(attr, translated);
    });
  }

  function translateTree(root, lang) {
    if (!root) return;

    if (root.nodeType === 3) {
      translateTextNode(root, lang);
      return;
    }

    if (root.nodeType !== 1) return;

    translateElementAttrs(root, lang);

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });

    var current;
    while ((current = walker.nextNode())) {
      translateTextNode(current, lang);
    }

    var all = root.querySelectorAll('*');
    all.forEach(function (el) { translateElementAttrs(el, lang); });
  }

  function translateDocumentTitle(lang) {
    var titleEl = document.querySelector('title');
    if (!titleEl) return;

    if (!titleEl.hasAttribute('data-i18n-original-title')) {
      titleEl.setAttribute('data-i18n-original-title', titleEl.textContent || '');
    }

    var original = titleEl.getAttribute('data-i18n-original-title') || '';
    if (lang === 'vi') {
      titleEl.textContent = translateToVietnamese(original);
      return;
    }
    titleEl.textContent = translateToEnglish(original);
  }

  function scheduleTranslation(root) {
    pendingTranslationRoots.add(root || document.body);
    if (translationTimer) return;
    translationTimer = setTimeout(function () {
      isApplyingTranslation = true;
      translateDocumentTitle(currentLang);
      pendingTranslationRoots.forEach(function (r) {
        translateTree(r || document.body, currentLang);
      });
      pendingTranslationRoots.clear();
      updateLanguageToggleUi();
      isApplyingTranslation = false;
      translationTimer = null;
    }, 20);
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS[lang]) return;
    currentLang = lang;
    setStoredLanguage(lang);
    document.documentElement.setAttribute('lang', lang === 'vi' ? 'vi' : 'en');
    updateInstitutionBrandingText();
    scheduleTranslation(document.body);
    window.dispatchEvent(new CustomEvent('stata:langchange', { detail: { lang: lang } }));
  }

  function t(text) {
    return translateText(String(text || ''), currentLang);
  }

  function getLanguage() {
    return currentLang;
  }

  function initTranslationObserver() {
    if (!document.body) return;
    if (translationObserver) translationObserver.disconnect();

    translationObserver = new MutationObserver(function (mutations) {
      if (isApplyingTranslation) return;
      var roots = [];
      mutations.forEach(function (m) {
        if (m.type === 'characterData' && m.target) {
          textOriginalMap.delete(m.target);
          roots.push(m.target);
        }
        if (m.type === 'attributes' && m.target && m.attributeName) {
          var store = attrOriginalMap.get(m.target);
          if (store && (m.attributeName in store)) delete store[m.attributeName];
          roots.push(m.target);
        }
        if (m.type === 'childList') {
          m.addedNodes.forEach(function (n) { roots.push(n); });
        }
      });

      if (!roots.length) return;
      roots.forEach(function (root) { scheduleTranslation(root); });
    });

    translationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });
  }

  function updateLanguageToggleUi() {
    document.querySelectorAll('.nav-lang-toggle').forEach(function (btn) {
      var nextLang = currentLang === 'vi' ? 'en' : 'vi';
      btn.setAttribute('data-next-lang', nextLang);
      btn.textContent = currentLang === 'vi' ? 'VI | EN' : 'EN | VI';
      btn.setAttribute('aria-label', currentLang === 'vi'
        ? 'Current language Vietnamese. Switch to English.'
        : 'Ngôn ngữ hiện tại là tiếng Anh. Chuyển sang tiếng Việt.');
      btn.setAttribute('title', currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt');
      btn.removeAttribute('aria-pressed');
      btn.classList.toggle('is-vi', currentLang === 'vi');
      btn.classList.toggle('is-en', currentLang === 'en');
    });
  }

  function initLanguageToggle() {
    document.querySelectorAll('.nav-inner').forEach(function (inner) {
      if (inner.querySelector('.nav-lang-toggle')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-lang-toggle';
      btn.setAttribute('data-i18n-skip', 'true');
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-next-lang') || (currentLang === 'vi' ? 'en' : 'vi');
        setLanguage(next);
      });

      var ham = inner.querySelector('.nav-hamburger');
      if (ham) inner.insertBefore(btn, ham);
      else inner.appendChild(btn);
    });

    updateLanguageToggleUi();
  }

  function updateInstitutionBrandingText() {
    var label = currentLang === 'en' ? INSTITUTION_LABEL.en : INSTITUTION_LABEL.vi;
    var logoAlt = currentLang === 'en'
      ? 'UEH Mekong Faculty of Finance and Banking'
      : 'Khoa Tài chính - Ngân hàng UEH Mekong';

    document.querySelectorAll('.ueh-footer-credit').forEach(function (node) {
      node.textContent = label;
    });

    document.querySelectorAll('.footer-ueh-logo').forEach(function (logo) {
      logo.alt = logoAlt;
    });
  }

  function initInstitutionBranding() {
    var logoSrc = getLogoSrc();
    document.querySelectorAll('.footer-bottom').forEach(function (footer) {
      if (footer.querySelector('.ueh-footer-credit')) return;

      footer.setAttribute('data-i18n-skip', 'true');
      footer.replaceChildren();

      var logo = document.createElement('img');
      logo.className = 'footer-ueh-logo';
      logo.alt = currentLang === 'en'
        ? 'UEH Mekong Faculty of Finance and Banking'
        : 'Khoa Tài chính - Ngân hàng UEH Mekong';
      logo.src = logoSrc;
      logo.setAttribute('loading', 'lazy');

      var credit = document.createElement('span');
      credit.className = 'ueh-footer-credit';

      footer.appendChild(logo);
      footer.appendChild(credit);
    });

    updateInstitutionBrandingText();
  }

  function initDynamicBackdrop() {
    if (!document.body || document.querySelector('.site-cosmos')) return;

    var layer = document.createElement('div');
    layer.className = 'site-cosmos';
    layer.setAttribute('data-i18n-skip', 'true');

    var orbitA = document.createElement('div');
    orbitA.className = 'bg-orbit bg-orbit-a';
    var orbitB = document.createElement('div');
    orbitB.className = 'bg-orbit bg-orbit-b';
    var orbitC = document.createElement('div');
    orbitC.className = 'bg-orbit bg-orbit-c';

    var beam = document.createElement('div');
    beam.className = 'bg-data-beam';

    var tags = document.createElement('div');
    tags.className = 'bg-econ-tags';
    ['OLS', 'IV', 'DID', 'RDD', 'FE', 'RE', 'VAR', 'ARDL', 'GMM', 'LASSO'].forEach(function (label, idx) {
      var tag = document.createElement('span');
      tag.className = 'bg-econ-tag';
      tag.textContent = label;
      tag.style.setProperty('--delay', (idx * 0.6) + 's');
      tags.appendChild(tag);
    });

    layer.appendChild(orbitA);
    layer.appendChild(orbitB);
    layer.appendChild(orbitC);
    layer.appendChild(beam);
    layer.appendChild(tags);
    document.body.insertBefore(layer, document.body.firstChild);
  }

  function initAntigravityCursor() {
    if (!window.matchMedia || !document.body) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.querySelector('.ag-cursor-dot')) return;

    var docEl = document.documentElement;
    docEl.classList.add('has-custom-cursor');

    var dot = document.createElement('div');
    dot.className = 'ag-cursor-dot';
    dot.setAttribute('data-i18n-skip', 'true');

    var ring = document.createElement('div');
    ring.className = 'ag-cursor-ring';
    ring.setAttribute('data-i18n-skip', 'true');

    var pulse = document.createElement('div');
    pulse.className = 'ag-cursor-pulse';
    pulse.setAttribute('data-i18n-skip', 'true');

    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.appendChild(pulse);

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var ringX = targetX;
    var ringY = targetY;
    var rafId = null;
    var running = false;

    var interactiveSelector = [
      'a',
      'button',
      '.btn-primary',
      '.btn-secondary',
      '.cmd-card',
      '.category-card',
      '.quick-path-card',
      '.comp-card',
      '.best-pkg-card',
      '.taxonomy-card',
      '.search-result-item',
      '.nav-dropdown-btn',
      '.nav-links a',
      'input',
      'select',
      'textarea',
      '[role="button"]'
    ].join(',');

    function render() {
      if (!running) return;
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      var scale = 1;
      if (ring.classList.contains('is-hover')) scale = 1.45;
      if (ring.classList.contains('is-text')) scale = 0.82;
      if (ring.classList.contains('is-pressed')) scale = scale * 0.78;
      dot.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0)';
      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) scale(' + scale + ')';
      rafId = window.requestAnimationFrame(render);
    }

    function startRender() {
      if (running) return;
      running = true;
      rafId = window.requestAnimationFrame(render);
    }

    function stopRender() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function showCursor() {
      dot.classList.add('is-visible');
      ring.classList.add('is-visible');
    }

    function hideCursor() {
      dot.classList.remove('is-visible');
      ring.classList.remove('is-visible');
      ring.classList.remove('is-hover');
      ring.classList.remove('is-text');
    }

    document.addEventListener('pointermove', function (evt) {
      targetX = evt.clientX;
      targetY = evt.clientY;
      startRender();
      showCursor();
    }, { passive: true });

    document.addEventListener('pointerdown', function (evt) {
      startRender();
      ring.classList.add('is-pressed');
      pulse.style.left = evt.clientX + 'px';
      pulse.style.top = evt.clientY + 'px';
      pulse.classList.remove('is-active');
      void pulse.offsetWidth;
      pulse.classList.add('is-active');
    });

    document.addEventListener('pointerup', function () {
      ring.classList.remove('is-pressed');
    });

    document.addEventListener('pointerover', function (evt) {
      var interactiveNode = evt.target.closest(interactiveSelector);
      if (!interactiveNode) return;
      ring.classList.add('is-hover');
      if (interactiveNode.matches('input, textarea, [contenteditable="true"]')) {
        ring.classList.add('is-text');
      }
    });

    document.addEventListener('pointerout', function (evt) {
      var leavingInteractive = evt.target.closest(interactiveSelector);
      if (!leavingInteractive) return;
      var toNode = evt.relatedTarget;
      if (toNode && toNode.closest && toNode.closest(interactiveSelector)) return;
      ring.classList.remove('is-hover');
      ring.classList.remove('is-text');
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        hideCursor();
        stopRender();
      } else {
        startRender();
        showCursor();
      }
    });

    window.addEventListener('blur', function () {
      hideCursor();
      stopRender();
    });

    window.addEventListener('focus', function () {
      startRender();
      showCursor();
    });

    window.addEventListener('pointerleave', function () {
      hideCursor();
      stopRender();
    });

    startRender();

    window.addEventListener('beforeunload', function () {
      stopRender();
    });
  }

  // ── Active nav link ──────────────────────────────────────────
  function markActiveNavLink() {
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav-links a');
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var target = href ? href.split('/').pop() : '';
      if (target && page === target) {
        link.classList.add('active');
      }
    });
  }

  // ── Mobile hamburger ─────────────────────────────────────────
  function initHamburger() {
    var btn = document.querySelector('.nav-hamburger');
    var menu = document.querySelector('.nav-links');
    if (!btn || !menu) return;
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Keyboard accessibility for dropdown ──────────────────────
  function initDropdowns() {
    var drops = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown'));
    if (!drops.length) return;

    function closeAll() {
      drops.forEach(function (d) {
        var b = d.querySelector('.nav-dropdown-btn');
        d.classList.remove('open');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    drops.forEach(function (drop) {
      var btn = drop.querySelector('.nav-dropdown-btn');
      var menu = drop.querySelector('.nav-dropdown-menu');
      if (!btn || !menu) return;

      if (!menu.id) {
        menu.id = 'nav-dropdown-menu-' + Math.random().toString(36).slice(2, 9);
      }
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', menu.id);

      function toggleDropdown() {
        var isOpen = drop.classList.contains('open');
        closeAll();
        if (!isOpen) {
          drop.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleDropdown();
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleDropdown();
          return;
        }
        if (e.key === 'Escape') {
          closeAll();
          btn.blur();
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-dropdown')) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  // ── Smooth scroll for in-page anchor links ───────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 60;
          var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
          var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  // ── Sidebar active section tracking (command pages) ──────────
  function initSidebarTracking() {
    var sections = document.querySelectorAll('.cmd-section[id]');
    var sidebarLinks = document.querySelectorAll('.page-sidebar a[href^="#"]');
    if (!sections.length || !sidebarLinks.length) return;

    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 60;

    function updateActive() {
      var current = '';
      sections.forEach(function (sec) {
        if (window.scrollY >= sec.offsetTop - navH - 32) {
          current = sec.id;
        }
      });
      sidebarLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  // ── Copy buttons on code blocks ──────────────────────────────
  function initCopyButtons() {
    document.querySelectorAll('.code-wrapper').forEach(function (wrapper) {
      var pre = wrapper.querySelector('pre');
      if (!pre) return;
      var btn = wrapper.querySelector('.copy-btn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var text = pre.innerText || pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
            scheduleTranslation(btn);
          }, 2000);
        }).catch(function () {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
            scheduleTranslation(btn);
          }, 2000);
        });
      });
    });
  }

  // ── Print button ─────────────────────────────────────────────
  function initPrintButtons() {
    document.querySelectorAll('.print-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.print();
      });
    });
  }

  window.StataI18n = {
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    t: t,
    apply: function () { scheduleTranslation(document.body); }
  };

  // ── Init on DOMContentLoaded ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    currentLang = getStoredLanguage();
    document.documentElement.setAttribute('lang', currentLang === 'vi' ? 'vi' : 'en');

    initDynamicBackdrop();
    initAntigravityCursor();
    initLanguageToggle();
    initInstitutionBranding();
    markActiveNavLink();
    initHamburger();
    initDropdowns();
    initSmoothScroll();
    initSidebarTracking();
    initCopyButtons();
    initPrintButtons();

    scheduleTranslation(document.body);
    initTranslationObserver();
  });

})();
