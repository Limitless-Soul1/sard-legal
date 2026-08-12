/* ═══════════════════════════════════════════════════════════════════════════
   Sard — legal pages
   Language, theme and the small amount of interaction these documents earn.
   Loaded in <head> without `defer` on purpose: the root attributes must be set
   before first paint, or the page flashes English at an Arabic reader and light
   at a dark-mode reader.

   Both languages live in one document, so a single URL serves both. That is
   what the Discord Developer Portal needs — one Terms URL, one Privacy URL.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var root = document.documentElement;
  var LANG_KEY = "sard-legal-lang";
  var THEME_KEY = "sard-legal-theme";

  /* localStorage throws in some privacy modes; a preference is never worth an
     exception that takes the page down with it. */
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* preference not persisted */ }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) { /* nothing to clear */ }
  }

  /* ═══ THE TWO PAPERS ══════════════════════════════════════════════════════
     Sard is the default and what the site opens on; Charcoal is the one
     alternative. Both are defined in the stylesheet, so applying a theme is a
     single attribute rather than a set of inline custom properties — the tokens
     have exactly one home. `paper` is here only to paint the control's chip.

     Sard's values are the application's Ivory set (its DEFAULT_LIGHT), shown
     here under the product's name; Charcoal keeps its own. The Arabic names are
     the application's own — see `theme.charcoal` in its Arabic locale. */
  var THEMES = [
    { id: "sard",     dark: false, paper: "#F5EEDD", name: { en: "Sard",     ar: "سَرْد" } },
    { id: "charcoal", dark: true,  paper: "#1C1C1E", name: { en: "Charcoal", ar: "فحميّ" } }
  ];
  var DEFAULT_THEME = "sard";

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  /* The stylesheet keys Charcoal off [data-theme="dark"], so this only has to
     say which of the two is showing. An unrecognised stored value falls back to
     the default rather than leaving the page in a state with no theme at all. */
  function applyTheme(id) {
    var t = themeById(id) || themeById(DEFAULT_THEME);
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-theme-id", t.id);
    return t;
  }

  function currentTheme() {
    return themeById(root.getAttribute("data-theme-id")) || themeById(DEFAULT_THEME);
  }

  /* ---- Language ---------------------------------------------------------
     Order of authority: an explicit ?lang= or #ar in the URL (so a link can
     point an Arabic reader straight at the Arabic text), then the reader's
     stored choice, then the browser's own languages, then English. */
  function initialLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) { /* older browser */ }
    var hash = location.hash.replace("#", "");
    if (q === "ar" || q === "en") return q;
    if (hash === "ar" || hash === "en") return hash;

    var stored = read(LANG_KEY);
    if (stored === "ar" || stored === "en") return stored;

    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      if (/^ar\b/i.test(langs[i])) return "ar";
    }
    return "en";
  }

  var T = {
    en: { theme: "Theme", pick: "Reading theme", anchor: "Link to this section", langBtn: "التبديل إلى العربية" },
    ar: { theme: "السمة", pick: "سمة القراءة", anchor: "رابط إلى هذا البند", langBtn: "Switch to English" }
  };
  function lang() { return root.getAttribute("data-lang") === "ar" ? "ar" : "en"; }

  function applyLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    root.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    /* The rail fills from the reading-start edge, which swaps with direction. */
    root.style.setProperty("--rail-origin", l === "ar" ? "right" : "left");

    var title = root.getAttribute("data-title-" + l);
    if (title) document.title = title;

    var btn = document.getElementById("langToggle");
    if (btn) btn.setAttribute("aria-label", T[l].langBtn);
  }

  /* ---- Run before paint ------------------------------------------------- */
  applyLang(initialLang());
  applyTheme(read(THEME_KEY) || DEFAULT_THEME);

  /* ═══ THE THEME CONTROL ══════════════════════════════════════════════════
     A two-segment control: both names visible, the current one marked, and the
     other one click away. Built in script, so a reader without it simply gets
     Sard and never sees a control that cannot work. */
  function buildThemeControl() {
    var host = document.getElementById("themeControl");
    if (!host) return;
    host.hidden = false;

    var seg = document.createElement("div");
    seg.className = "seg";
    seg.setAttribute("role", "radiogroup");

    var items = THEMES.map(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "seg-item";
      b.setAttribute("role", "radio");
      b.setAttribute("data-theme-pick", t.id);
      var chip = document.createElement("span");
      chip.className = "seg-chip";
      chip.style.background = t.paper;
      chip.setAttribute("aria-hidden", "true");
      var name = document.createElement("span");
      b.appendChild(chip);
      b.appendChild(name);
      b.addEventListener("click", function () {
        applyTheme(t.id);
        write(THEME_KEY, t.id);
        sync();
      });
      seg.appendChild(b);
      return { el: b, name: name, theme: t };
    });

    /* Arrow keys move between the two, as a radio group should. */
    seg.addEventListener("keydown", function (e) {
      var i = items.map(function (x) { return x.el; }).indexOf(document.activeElement);
      if (i < 0) return;
      var rtl = lang() === "ar";
      var step = 0;
      if (e.key === "ArrowRight") step = rtl ? -1 : 1;
      else if (e.key === "ArrowLeft") step = rtl ? 1 : -1;
      else if (e.key === "ArrowDown") step = 1;
      else if (e.key === "ArrowUp") step = -1;
      else return;
      e.preventDefault();
      var n = (i + step + items.length) % items.length;
      items[n].el.focus();
      items[n].el.click();
    });

    host.appendChild(seg);

    function sync() {
      var l = lang();
      var cur = currentTheme();
      seg.setAttribute("aria-label", T[l].pick);
      items.forEach(function (it) {
        it.name.textContent = it.theme.name[l];
        var on = it.theme.id === cur.id;
        it.el.setAttribute("aria-checked", on ? "true" : "false");
        /* Only the selected segment stays in the tab order, which is how a
           radio group behaves; the arrows reach the other one. */
        it.el.tabIndex = on ? 0 : -1;
      });
    }

    sync();
    return sync;
  }

  /* ═══ READING PROGRESS ════════════════════════════════════════════════════
     How far through the document you are. Written straight to a custom property
     on every frame the scroll changes — no layout property is animated. */
  function buildRail() {
    var rail = document.getElementById("rail");
    if (!rail) return;
    var fill = document.createElement("i");
    rail.appendChild(fill);
    var ticking = false;

    function measure() {
      ticking = false;
      var doc = document.documentElement;
      var span = doc.scrollHeight - doc.clientHeight;
      var p = span > 0 ? doc.scrollTop / span : 0;
      rail.style.setProperty("--read", Math.min(1, Math.max(0, p)).toFixed(4));
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    measure();
    return measure;
  }

  /* ═══ CLAUSE ANCHORS ══════════════════════════════════════════════════════
     Legal text gets quoted, so every clause gets a link. The heading carries a
     `data-section` number rather than an id, because both languages are in the
     document at once and an id would collide. The hash is resolved against
     whichever language is showing, so one link works for both readers. */
  function buildAnchors() {
    var heads = document.querySelectorAll(".doc h2[data-section]");
    if (!heads.length) return;
    Array.prototype.forEach.call(heads, function (h) {
      var a = document.createElement("a");
      a.className = "anchor";
      a.href = "#s" + h.getAttribute("data-section");
      a.textContent = "#";
      a.setAttribute("aria-label", T[lang()].anchor);
      h.appendChild(a);
    });

    function go() {
      var m = /^#s(\d+)$/.exec(location.hash);
      if (!m) return;
      var showing = lang() === "ar" ? ".lang-ar" : ".lang-en";
      var target = document.querySelector(showing + ' h2[data-section="' + m[1] + '"]');
      if (!target) return;
      target.scrollIntoView({ block: "start", behavior: prefersReduced() ? "auto" : "smooth" });
    }
    function prefersReduced() {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
    addEventListener("hashchange", go);
    if (location.hash) setTimeout(go, 60);
    return function () {
      Array.prototype.forEach.call(document.querySelectorAll(".anchor"), function (a) {
        a.setAttribute("aria-label", T[lang()].anchor);
      });
    };
  }

  /* ═══ THE REPORT FORM ═════════════════════════════════════════════════════
     Why this page composes a report but does not submit it.

     Submitting straight to the GitHub API needs a credential that can write to
     the repository. This site is static, served from GitHub Pages, and anything
     it ships is public — so that credential would have to live behind a
     serverless proxy, which then needs its own secret store, CORS rules, a
     captcha and a rate limiter, because it would be an anonymous write path
     into the repository that has to be defended forever.

     It would also make attachments worse, not better: GitHub's REST API has no
     endpoint for uploading an issue attachment at all. The web composer uses an
     internal one. A proxy would therefore have to put files in some other
     bucket and link them, and every issue would be authored by a bot instead of
     by the person reporting it, so nobody could be replied to.

     Handing the composed text to GitHub's own form avoids all of that, and
     attachments work properly because they happen in the one place that can
     actually accept them. The cost is one extra click and a GitHub account.
     ═══════════════════════════════════════════════════════════════════════ */
  var REPO = "https://github.com/Limitless-Soul1/sard-legal";

  var TYPES = [
    { id: "bug",      template: "bug.yml",      prefix: "Bug: ",           en: "Bug",             ar: "علّة" },
    { id: "feedback", template: "feedback.yml", prefix: "Feedback: ",      en: "Feedback",        ar: "اقتراح" },
    { id: "question", template: "question.yml", prefix: "Question: ",      en: "Question",        ar: "سؤال" },
    { id: "privacy",  template: "privacy.yml",  prefix: "Privacy/legal: ", en: "Privacy & legal", ar: "الخصوصية والشروط" },
    { id: "other",    template: null,           prefix: "",                en: "Other",           ar: "غير ذلك" }
  ];

  /* GitHub rejects a request line that is too long, and browsers cap it too.
     Rather than let a long report fail on arrival, the page says so first. */
  var URL_LIMIT = 7000;

  var R = {
    en: {
      hint: {
        bug: "What you did, what you expected, and what happened instead.",
        feedback: "Describe the idea, and what it would let you do that you cannot do today.",
        question: "What would you like to know?",
        privacy: "Your question, or what you believe is wrong. A clause number is enough.",
        other: "Whatever you would like to tell us."
      },
      needTitle: "Add a title and a description to continue.",
      ready: "Opens GitHub's report form with everything above already filled in.",
      tooLong: "This report is too long to carry in a link. Use Copy as text, then paste it into GitHub.",
      copied: "Copied. Paste it wherever suits you.",
      copyFailed: "Copying was blocked — select the text above and copy it manually."
    },
    ar: {
      hint: {
        bug: "ما الذي فعلتَه، وما الذي توقّعتَه، وما الذي حدث بدلًا منه.",
        feedback: "صِف الفكرة، وما الذي ستتيحه لك ممّا لا تستطيعه اليوم.",
        question: "ما الذي تودّ معرفته؟",
        privacy: "سؤالك، أو ما تراه خطأً. ويكفي أن تذكر رقم البند.",
        other: "ما تودّ إخبارنا به."
      },
      needTitle: "أضِف عنوانًا ووصفًا للمتابعة.",
      ready: "يفتح استمارة البلاغ في GitHub وقد امتلأت بما كتبتَه أعلاه.",
      tooLong: "هذا البلاغ أطول من أن يُحمَل في رابط. استعمل «نسخ النصّ» ثمّ ألصِقه في GitHub.",
      copied: "نُسِخ. ألصِقه حيث تشاء.",
      copyFailed: "تعذّر النسخ — حدّد النصّ أعلاه وانسخه يدويًّا."
    }
  };

  function buildReport(l) {
    var suffix = l === "ar" ? "Ar" : "";
    var form = document.getElementById("reportForm" + suffix);
    if (!form) return;

    var choices = document.getElementById("typeChoices" + suffix);
    var titleEl = document.getElementById("rTitle" + suffix);
    var bodyEl = document.getElementById("rBody" + suffix);
    var detailsEl = document.getElementById("rDetails" + suffix);
    var hintEl = document.getElementById("bodyHint" + suffix);
    var link = document.getElementById("rSubmit" + suffix);
    var copyBtn = document.getElementById("rCopy" + suffix);
    var note = document.getElementById("rNote" + suffix);
    var chosen = "bug";

    TYPES.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.setAttribute("role", "radio");
      b.setAttribute("data-type", t.id);
      var dot = document.createElement("span");
      dot.className = "choice-dot";
      dot.setAttribute("aria-hidden", "true");
      var label = document.createElement("span");
      label.textContent = t[l];
      b.appendChild(dot);
      b.appendChild(label);
      b.addEventListener("click", function () { chosen = t.id; update(); });
      choices.appendChild(b);
    });

    function type() {
      for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === chosen) return TYPES[i];
      return TYPES[0];
    }

    /* The plain-text form, used for Copy and for the untemplated "Other". */
    function asText() {
      var t = type();
      var out = (titleEl.value || "").trim();
      out += "\n\n" + (bodyEl.value || "").trim();
      var d = (detailsEl.value || "").trim();
      if (d) out += "\n\n---\n\n" + (l === "ar" ? "الإصدار والنظام" : "Version and system") + "\n\n" + d;
      return out;
    }

    function githubUrl() {
      var t = type();
      var title = (titleEl.value || "").trim();
      var q = [];
      if (t.template) {
        q.push("template=" + encodeURIComponent(t.template));
        q.push("title=" + encodeURIComponent(t.prefix + title));
        /* These names are the field ids in .github/ISSUE_TEMPLATE/*.yml.
           Renaming one there without renaming it here silently stops prefilling. */
        q.push("description=" + encodeURIComponent((bodyEl.value || "").trim()));
        var d = (detailsEl.value || "").trim();
        if (d) q.push("details=" + encodeURIComponent(d));
      } else {
        q.push("title=" + encodeURIComponent(title));
        q.push("body=" + encodeURIComponent((bodyEl.value || "").trim() +
          ((detailsEl.value || "").trim() ? "\n\n---\n\n" + detailsEl.value.trim() : "")));
      }
      return REPO + "/issues/new?" + q.join("&");
    }

    function update() {
      var l2 = lang();
      var s = R[l2] || R.en;
      Array.prototype.forEach.call(choices.children, function (c) {
        c.setAttribute("aria-checked", c.getAttribute("data-type") === chosen ? "true" : "false");
      });
      if (hintEl) hintEl.textContent = s.hint[chosen];

      var filled = (titleEl.value || "").trim() && (bodyEl.value || "").trim();
      var url = githubUrl();
      var tooLong = url.length > URL_LIMIT;

      link.href = tooLong ? REPO + "/issues/new?template=" + (type().template || "") : url;
      link.setAttribute("aria-disabled", filled ? "false" : "true");
      note.textContent = !filled ? s.needTitle : (tooLong ? s.tooLong : s.ready);
      note.className = tooLong && filled ? "copied" : "";
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var s = R[lang()] || R.en;
        var text = asText();
        var done = function () { note.textContent = s.copied; note.className = "copied"; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            note.textContent = s.copyFailed; note.className = "";
          });
        } else {
          /* Older browsers: a throwaway textarea is still the only way. */
          var ta = document.createElement("textarea");
          ta.value = text; ta.setAttribute("readonly", "");
          ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); }
          catch (e) { note.textContent = s.copyFailed; }
          document.body.removeChild(ta);
        }
      });
    }

    [titleEl, bodyEl, detailsEl].forEach(function (el) {
      el.addEventListener("input", update);
    });
    update();
    return update;
  }

  /* ---- Wire everything once the document exists -------------------------- */
  function ready() {
    applyLang(lang());
    var syncTheme = buildThemeControl();
    var syncAnchors = buildAnchors();
    var measureRail = buildRail();
    /* Both languages of the report page are in the document at once, so each
       gets its own wired copy; only one is ever visible. */
    var updateReports = [buildReport("en"), buildReport("ar")].filter(Boolean);

    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        applyLang(lang() === "ar" ? "en" : "ar");
        write(LANG_KEY, lang());
        if (syncTheme) syncTheme();
        if (syncAnchors) syncAnchors();
        updateReports.forEach(function (u) { u(); });
        /* The two languages are not the same length, so the scroll span moves. */
        if (measureRail) measureRail();
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
