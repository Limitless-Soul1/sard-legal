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

  /* ═══ THE SIXTEEN PAPERS ═══════════════════════════════════════════════════
     Read out of the application's own `src/theme/themes.ts`, in its own order.
     Eight colour tokens each; everything else on the page is a color-mix of
     one of them, so setting these eight repaints the site. */
  var THEMES = [
    { id:"ivory",       name:"Ivory",        dark:false, paper:"#F5EEDD", desk:"#E7DCC4", chrome:"#EAE0CA", border:"rgba(43,37,33,.10)",    text:"#2B2521", muted:"#8A7E6E", accent:"#9C5A3C", sel:"rgba(156,90,60,.20)" },
    { id:"sepia",       name:"Sepia",        dark:false, paper:"#E8D9BC", desk:"#DECBA8", chrome:"#EFE3C9", border:"rgba(69,56,42,.12)",    text:"#45382A", muted:"#8C7A5E", accent:"#97582F", sel:"rgba(151,88,47,.20)" },
    { id:"slate",       name:"Slate",        dark:true,  paper:"#222A31", desk:"#1A2127", chrome:"#2A333B", border:"rgba(255,255,255,.08)", text:"#CBD3D9", muted:"#7E8A93", accent:"#C98A5E", sel:"rgba(201,138,94,.28)" },
    { id:"trueblack",   name:"True-Black",   dark:true,  paper:"#000000", desk:"#0E0E0E", chrome:"#0E0E0E", border:"rgba(255,255,255,.10)", text:"#CFC8BA", muted:"#6E6A62", accent:"#C98A5E", sel:"rgba(201,138,94,.30)" },
    { id:"sage",        name:"Sage",         dark:false, paper:"#F0F2E8", desk:"#DCE0D0", chrome:"#E9ECE0", border:"rgba(46,52,43,.12)",    text:"#2E342B", muted:"#7C8473", accent:"#5E7A52", sel:"rgba(199,212,158,.55)" },
    { id:"rosequartz",  name:"Rose Quartz",  dark:false, paper:"#FBF1F1", desk:"#EEDEDE", chrome:"#F5EAEA", border:"rgba(58,47,48,.12)",    text:"#3A2F30", muted:"#9B7E80", accent:"#B5727B", sel:"rgba(239,194,182,.55)" },
    { id:"parchment",   name:"Parchment",    dark:false, paper:"#F0E2BE", desk:"#DFCEA3", chrome:"#E7D7B0", border:"rgba(58,46,24,.14)",    text:"#3A2E14", muted:"#8A7448", accent:"#9A7B3F", sel:"rgba(224,184,92,.50)" },
    { id:"dusk",        name:"Dusk",         dark:true,  paper:"#1B2130", desk:"#11141D", chrome:"#181D29", border:"rgba(255,255,255,.08)", text:"#D8DEEC", muted:"#7E8AA6", accent:"#8FA6D8", sel:"rgba(143,166,216,.32)" },
    { id:"ink",         name:"Ink",          dark:false, paper:"#FFFFFF", desk:"#F1EFE6", chrome:"#FBFAF5", border:"rgba(0,0,0,.30)",       text:"#0E0D0A", muted:"#444038", accent:"#7A2E1E", sel:"rgba(244,196,48,.60)" },
    { id:"espresso",    name:"Espresso",     dark:true,  paper:"#221912", desk:"#1A130D", chrome:"#1B130C", border:"rgba(255,255,255,.07)", text:"#EADCC6", muted:"#998771", accent:"#D49A6A", sel:"rgba(212,154,106,.30)" },
    { id:"forestnight", name:"Forest Night", dark:true,  paper:"#15201A", desk:"#101813", chrome:"#131D17", border:"rgba(255,255,255,.07)", text:"#D6E2D4", muted:"#7C9381", accent:"#82B08C", sel:"rgba(130,176,140,.30)" },
    { id:"mulberry",    name:"Mulberry",     dark:true,  paper:"#221620", desk:"#1A1119", chrome:"#1C131A", border:"rgba(255,255,255,.07)", text:"#E6D8E2", muted:"#A98FA3", accent:"#C189B0", sel:"rgba(193,137,176,.30)" },
    { id:"charcoal",    name:"Charcoal",     dark:true,  paper:"#1C1C1E", desk:"#161617", chrome:"#161617", border:"rgba(255,255,255,.07)", text:"#DCD9D2", muted:"#8A8881", accent:"#C98A5E", sel:"rgba(201,138,94,.28)" },
    { id:"nocturne",    name:"Nocturne",     dark:true,  paper:"#122023", desk:"#0E1719", chrome:"#101C1F", border:"rgba(255,255,255,.07)", text:"#CFE0E0", muted:"#6E8A8C", accent:"#5FA8A8", sel:"rgba(95,168,168,.30)" },
    { id:"linen",       name:"Linen",        dark:false, paper:"#F4F2EA", desk:"#E6E4DC", chrome:"#ECEAE1", border:"rgba(42,41,37,.10)",    text:"#2A2925", muted:"#8E8B82", accent:"#5E6B7A", sel:"rgba(94,107,122,.18)" },
    { id:"moonlit",     name:"Moonlit Sky",  dark:true,  paper:"#121A2E", desk:"#0B1021", chrome:"#0E1526", border:"rgba(143,166,200,.14)", text:"#F5E8C8", muted:"#8FA6C8", accent:"#E6C77A", sel:"rgba(230,199,122,.26)" }
  ];

  /* The derived tokens are not free choices — they follow the paper's polarity.
     A dark paper cannot carry a light paper's page shadow, and the grain has to
     invert its blend or it darkens what it should lift. */
  var DARK_DERIVED = {
    "--sh-page": "inset 1px 0 0 rgba(255,255,255,.05), inset -1px 0 0 rgba(255,255,255,.05)",
    "--sh-raise": "0 6px 18px rgba(0,0,0,.40)",
    "--sh-float": "0 16px 42px rgba(0,0,0,.50)",
    "--grain-blend": "screen",
    "--grain-op": ".020",
    "--gilt": "#D8B678"
  };
  var LIGHT_DERIVED = {
    "--sh-page": "0 0 30px rgba(60,40,16,.10), -1px 0 0 rgba(43,37,33,.05), 1px 0 0 rgba(43,37,33,.05)",
    "--sh-raise": "0 6px 18px rgba(40,28,14,.16)",
    "--sh-float": "0 16px 42px rgba(40,28,14,.24)",
    "--grain-blend": "multiply",
    "--grain-op": ".035",
    "--gilt": "#C9A15E"
  };

  var TOKEN_OF = {
    paper: "--paper-bg", desk: "--app-bg", chrome: "--chrome-bg", border: "--chrome-border",
    text: "--text", muted: "--muted", accent: "--accent", sel: "--selection"
  };

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  /* Applying a paper writes the eight tokens plus the derived set as inline
     custom properties, which outrank the stylesheet's defaults. Clearing them
     hands the page back to the system preference — there is no third state to
     keep in sync. */
  function applyTheme(id) {
    var t = id ? themeById(id) : null;
    var style = root.style;
    var key;

    if (!t) {
      for (key in TOKEN_OF) style.removeProperty(TOKEN_OF[key]);
      for (key in DARK_DERIVED) style.removeProperty(key);
      root.removeAttribute("data-theme");
      root.removeAttribute("data-theme-id");
      return;
    }
    for (key in TOKEN_OF) style.setProperty(TOKEN_OF[key], t[key]);
    var derived = t.dark ? DARK_DERIVED : LIGHT_DERIVED;
    for (key in derived) style.setProperty(key, derived[key]);
    /* Keep data-theme truthful: anything keyed off light/dark still works. */
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-theme-id", t.id);
  }

  function systemIsDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  /* What the reader is actually looking at, whether they chose it or not. */
  function currentTheme() {
    var chosen = themeById(root.getAttribute("data-theme-id"));
    if (chosen) return chosen;
    return themeById(systemIsDark() ? "charcoal" : "ivory");
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
    en: {
      theme: "Theme", system: "Follow the system", following: "Following your system setting",
      chose: "Chosen for this site", pick: "Choose a reading theme",
      anchor: "Link to this section", langBtn: "التبديل إلى العربية"
    },
    ar: {
      theme: "السمة", system: "اتّبع النظام", following: "يتبع إعداد نظامك",
      chose: "مختارة لهذا الموقع", pick: "اختر سمة القراءة",
      anchor: "رابط إلى هذا البند", langBtn: "Switch to English"
    }
  };
  function lang() { return root.getAttribute("data-lang") === "ar" ? "ar" : "en"; }

  function applyLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    root.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    /* The rail fills from the reading-start edge, which swaps with direction. */
    root.style.setProperty("--rail-origin", l === "ar" ? "right" : "left");
    root.style.setProperty("--menu-edge", l === "ar" ? "left" : "right");

    var title = root.getAttribute("data-title-" + l);
    if (title) document.title = title;

    var btn = document.getElementById("langToggle");
    if (btn) btn.setAttribute("aria-label", T[l].langBtn);
  }

  /* ---- Run before paint ------------------------------------------------- */
  applyLang(initialLang());
  applyTheme(read(THEME_KEY));

  /* ═══ THE ORGAN ═══════════════════════════════════════════════════════════ */
  function buildOrgan() {
    var organ = document.getElementById("organ");
    if (!organ) return;
    organ.hidden = false;               /* only exists when scripting does */

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tool";
    btn.id = "organBtn";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    var chip = document.createElement("span");
    chip.className = "organ-chip";
    var label = document.createElement("span");
    label.className = "organ-name";
    btn.appendChild(chip);
    btn.appendChild(label);

    var menu = document.createElement("div");
    menu.className = "organ-menu";
    menu.id = "organMenu";
    menu.hidden = true;
    menu.setAttribute("role", "dialog");

    var grid = document.createElement("div");
    grid.className = "organ-grid";
    grid.setAttribute("role", "radiogroup");

    var cells = THEMES.map(function (t) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "organ-cell";
      cell.setAttribute("role", "radio");
      cell.setAttribute("data-theme-cell", t.id);
      var sw = document.createElement("span");
      sw.className = "organ-sw";
      sw.style.background = t.paper;
      sw.style.color = t.text;
      sw.textContent = "س";                 /* the paper, with real ink on it */
      sw.setAttribute("aria-hidden", "true");
      var nm = document.createElement("span");
      nm.className = "organ-label";
      nm.textContent = t.name;
      cell.appendChild(sw);
      cell.appendChild(nm);
      cell.addEventListener("click", function () {
        applyTheme(t.id);
        write(THEME_KEY, t.id);
        sync();
        close(true);
      });
      grid.appendChild(cell);
      return cell;
    });

    var foot = document.createElement("div");
    foot.className = "organ-foot";
    var note = document.createElement("span");
    note.className = "organ-note";
    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "organ-reset";
    reset.addEventListener("click", function () {
      applyTheme(null);
      drop(THEME_KEY);
      sync();
    });
    foot.appendChild(note);
    foot.appendChild(reset);

    menu.appendChild(grid);
    menu.appendChild(foot);
    organ.appendChild(btn);
    organ.appendChild(menu);

    function sync() {
      var l = lang();
      var cur = currentTheme();
      var chosen = root.getAttribute("data-theme-id");
      chip.style.background = cur.paper;
      label.textContent = cur.name;
      btn.setAttribute("aria-label", T[l].pick + " — " + cur.name);
      note.textContent = chosen ? T[l].chose : T[l].following;
      reset.textContent = T[l].system;
      reset.hidden = !chosen;
      grid.setAttribute("aria-label", T[l].pick);
      cells.forEach(function (c) {
        c.setAttribute("aria-checked", c.getAttribute("data-theme-cell") === chosen ? "true" : "false");
      });
    }

    function open() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("pointerdown", onOutside, true);
      var checked = grid.querySelector('[aria-checked="true"]') || cells[0];
      checked.focus();
    }
    function close(refocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onOutside, true);
      if (refocus) btn.focus();
    }
    function onOutside(e) { if (!organ.contains(e.target)) close(false); }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      var i = cells.indexOf(document.activeElement);
      if (i < 0) return;
      /* Arrow keys walk the grid. Left and right follow the reading direction,
         so the arrow that means "onward" is the one that moves onward. */
      var rtl = lang() === "ar";
      var step = 0;
      if (e.key === "ArrowRight") step = rtl ? -1 : 1;
      else if (e.key === "ArrowLeft") step = rtl ? 1 : -1;
      else if (e.key === "ArrowDown") step = 4;
      else if (e.key === "ArrowUp") step = -4;
      else if (e.key === "Home") step = -i;
      else if (e.key === "End") step = cells.length - 1 - i;
      else return;
      e.preventDefault();
      var n = i + step;
      if (n < 0 || n >= cells.length) return;
      cells[n].focus();
    }

    btn.addEventListener("click", function () { menu.hidden ? open() : close(true); });
    organ.addEventListener("langchange", sync);
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
    var syncOrgan = buildOrgan();
    var syncAnchors = buildAnchors();
    var measureRail = buildRail();

    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        applyLang(lang() === "ar" ? "en" : "ar");
        write(LANG_KEY, lang());
        if (syncOrgan) syncOrgan();
        if (syncAnchors) syncAnchors();
        /* The two languages are not the same length, so the scroll span moves. */
        if (measureRail) measureRail();
      });
    }

    /* While the reader is following the system, follow it live. */
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () { if (!root.getAttribute("data-theme-id") && syncOrgan) syncOrgan(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
