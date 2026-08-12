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

  /* ---- Wire everything once the document exists -------------------------- */
  function ready() {
    applyLang(lang());
    var syncTheme = buildThemeControl();
    var syncAnchors = buildAnchors();
    var measureRail = buildRail();

    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        applyLang(lang() === "ar" ? "en" : "ar");
        write(LANG_KEY, lang());
        if (syncTheme) syncTheme();
        if (syncAnchors) syncAnchors();
        /* The two languages are not the same length, so the scroll span moves. */
        if (measureRail) measureRail();
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
