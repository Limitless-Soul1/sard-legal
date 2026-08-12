/* ═══════════════════════════════════════════════════════════════════════════
   Sard — legal pages
   Language and theme. Loaded in <head> without `defer` on purpose: the root
   attributes must be set before first paint, or the page flashes English at an
   Arabic reader and light at a dark-mode reader.

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

  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;

    var btn = document.getElementById("langToggle");
    if (btn) {
      /* The button always names the language it switches TO, written in that
         language — the one label a reader of either language can act on. */
      btn.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    }
  }

  /* ---- Theme ------------------------------------------------------------
     Unset means "follow the system", which is the honest default. Toggling
     writes an explicit choice that wins in both directions from then on. */
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }

  function systemIsDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function effectiveTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return systemIsDark() ? "dark" : "light";
  }

  /* Which of the two icons is shown is decided in the stylesheet — see the note
     beside `.ico-sun` there. All this has to do is keep the label truthful. */
  function syncThemeButton() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var dark = effectiveTheme() === "dark";
    var lang = root.getAttribute("data-lang") === "ar" ? "ar" : "en";
    btn.setAttribute("aria-label",
      dark ? (lang === "ar" ? "التبديل إلى السمة الفاتحة" : "Switch to the light theme")
           : (lang === "ar" ? "التبديل إلى السمة الداكنة" : "Switch to the dark theme"));
  }

  /* ---- Run before paint ------------------------------------------------- */
  applyLang(initialLang());
  applyTheme(read(THEME_KEY));

  /* ---- Wire the controls once the document exists ------------------------ */
  function ready() {
    applyLang(root.getAttribute("data-lang") === "ar" ? "ar" : "en");
    syncThemeButton();

    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        var next = root.getAttribute("data-lang") === "ar" ? "en" : "ar";
        applyLang(next);
        write(LANG_KEY, next);
        syncThemeButton();
      });
    }

    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var next = effectiveTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        write(THEME_KEY, next);
        syncThemeButton();
      });
    }

    /* While the reader is following the system, follow it live. */
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () { if (!root.getAttribute("data-theme")) syncThemeButton(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
