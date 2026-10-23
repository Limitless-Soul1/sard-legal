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
  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }
  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ═══ ARRIVAL ═════════════════════════════════════════════════════════════
     Sections on the home page rise into place as they reach the reader. The
     hidden starting state only exists under `html.reveal`, which is set here
     before first paint — and taken off again if the observer that would undo
     it never gets wired, so a script failure can never leave the page blank. */
  var revealWired = false;
  if ("IntersectionObserver" in window) {
    root.classList.add("reveal");
    setTimeout(function () { if (!revealWired) root.classList.remove("reveal"); }, 2500);
  }

  /* ═══ THE LOOKS ═══════════════════════════════════════════════════════════
     Six real Sard looks. Sard is the default and what the site opens on; the
     rest are chosen. Every look's colours are defined in the stylesheet, keyed
     by `data-theme-id`, so applying one is a single attribute rather than a set
     of inline custom properties — the tokens have exactly one home. `paper` and
     `accent` here only paint the pickers' swatches; `note` is the line under
     the screens in the looks section.

     Sard's values are the application's Ivory set (its DEFAULT_LIGHT), shown
     under the product's name; Charcoal is the application's night theme. Ember
     & Iron and RedRose are looks made in Sard and keep the names they were
     shared under; Ninth Wave and Sierra are built on public-domain paintings,
     credited in the footer. */
  var THEMES = [
    { id: "sard", dark: false, paper: "#F5EEDD", accent: "#9C5A3C",
      name: { en: "Sard", ar: "سَرْد" },
      note: { en: "The default paper — warm ivory, for long reading by day.",
              ar: "الورق الافتراضي: عاجيّ دافئ لقراءة النهار الطويلة." } },
    { id: "charcoal", dark: true, paper: "#1C1C1E", accent: "#C98A5E",
      name: { en: "Charcoal", ar: "فحميّ" },
      note: { en: "The night paper — a soft charcoal that keeps the page quiet after dark.",
              ar: "ورق الليل: فحميّ ليّن يُبقي الصفحة هادئة بعد العتمة." } },
    { id: "ember", dark: true, paper: "#000000", accent: "#C98A5E",
      name: { en: "Ember & Iron", ar: "Ember & Iron" },
      note: { en: "True black with ember accents, over a station at dusk.",
              ar: "أسود خالص بلمسات الجمر، فوق محطّةٍ عند الغروب." } },
    { id: "redrose", dark: true, paper: "#2B3540", accent: "#CE2D2D",
      name: { en: "RedRose", ar: "RedRose" },
      note: { en: "Slate and crimson, with a rider through the poppies.",
              ar: "أردوازيّ وقرمزيّ، وفارسٌ يعبر حقل الخشخاش." } },
    { id: "ninthwave", dark: true, paper: "#101B1A", accent: "#E8783C",
      name: { en: "Ninth Wave", ar: "الموجة التاسعة" },
      note: { en: "Deep sea and flame, after Aivazovsky’s The Ninth Wave (1850).",
              ar: "بحرٌ عميق ولهب، عن لوحة «الموجة التاسعة» لآيفازوفسكي (1850)." } },
    { id: "sierra", dark: false, paper: "#EFEEE8", accent: "#8C6B2F",
      name: { en: "Sierra", ar: "سييرا" },
      note: { en: "Mist and morning light, after Bierstadt’s Among the Sierra Nevada (1868).",
              ar: "ضبابٌ وضوء صباح، عن لوحة «بين جبال سييرا نيفادا» لبيرشتات (1868)." } }
  ];
  var DEFAULT_THEME = "sard";
  var LOOK_DIR = "assets/looks/";

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  /* `data-theme-id` picks the look's colours; `data-theme` says whether it is a
     night paper, which carries the shared night shadows and `color-scheme`. An
     unrecognised stored value falls back to the default rather than leaving the
     page in a state with no look at all. */
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
    en: { pick: "Look", anchor: "Link to this section", langBtn: "التبديل إلى العربية",
          screens: "Screens from Sard", looks: "Choose a look",
          shot: { library: "Sard’s library in the {look} look",
                  reading: "A page of Alice’s Adventures in Wonderland in the {look} look" } },
    ar: { pick: "الهيئة", anchor: "رابط إلى هذا البند", langBtn: "Switch to English",
          screens: "لقطات من سَرْد", looks: "اختر هيئة",
          shot: { library: "مكتبة سَرْد بهيئة {look}",
                  reading: "صفحة من «رسالة الغفران» بهيئة {look}" } }
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

  /* ═══ CHANGING THE PAPER ══════════════════════════════════════════════════
     Where the browser can, the new paper spreads across the old one from the
     point that was clicked, the way a sheet is laid over a desk. Everywhere
     else — and for anyone who asks for less motion — it simply changes. */
  var themeSyncs = [];
  function syncThemes() { themeSyncs.forEach(function (s) { s(); }); }

  /* A CHANGE OF MIND NEVER WAITS. `asked` is the look the reader asked for last,
     which during a sweep is not yet the look on screen — comparing against the
     screen would ignore a quick second choice of the look being left. A choice
     made while a sweep is still running ends that sweep where it is and is
     applied at once, without starting another. */
  var sweep = null, asked = null;

  function switchTheme(id, origin) {
    if (id === (sweep ? asked : currentTheme().id)) return;
    asked = id;
    write(THEME_KEY, id);
    /* Always the LATEST choice: a sweep that was cut short may still run its
       own update a moment later, and it must land on the newest look too. */
    function commit() { applyTheme(asked); syncThemes(); }

    if (sweep) {
      var running = sweep;
      sweep = null;
      try { running.skipTransition(); } catch (e) { /* already over */ }
      commit();
      return;
    }
    if (!document.startViewTransition || prefersReduced() || !origin) { commit(); return; }

    var x = origin.x, y = origin.y;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("vt-theme");
    var vt = sweep = document.startViewTransition(commit);
    vt.ready.then(function () {
      root.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
        { duration: 560, easing: "cubic-bezier(.16,1,.3,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }, function () { /* skipped: the theme has still been applied */ });
    vt.finished.then(done, done);
    function done() {
      root.classList.remove("vt-theme");
      if (sweep === vt) sweep = null;
    }
  }

  /* A PRESS DURING A SWEEP STILL COUNTS. While a sweep runs, the page is drawn by
     the transition's own layer, and the browser sends every press to <html> —
     `pointer-events` on that layer does not change it — so the chip under the
     finger never heard a quick second choice. Measured with real input: Charcoal
     then RedRose 120 ms apart ended on Charcoal. Now a press during a sweep ends
     the sweep where it is, and its click is replayed on whatever is really under
     the pointer once the page is live again. */
  var replay = null;
  document.addEventListener("pointerdown", function (e) {
    if (!sweep) return;
    var running = sweep;
    sweep = null;
    replay = { x: e.clientX, y: e.clientY, live: running.finished.catch(function () {}) };
    try { running.skipTransition(); } catch (err) { /* already over */ }
  }, true);
  document.addEventListener("click", function (e) {
    var at = replay;
    replay = null;
    if (!at || e.target !== root) return;
    e.stopPropagation();
    at.live.then(function () {
      requestAnimationFrame(function () {
        var el = document.elementFromPoint(at.x, at.y);
        var control = el && el.closest("button, a, [role=radio], [role=tab]");
        if (control) control.click();
      });
    });
  }, true);

  /* ═══ THE LOOK PICKERS ════════════════════════════════════════════════════
     Two ways to choose, always in step: a menu in the top bar on every page,
     and a row of chips in the looks section of the home page. Both are built in
     script, so a reader without it simply gets Sard and never sees a control
     that cannot work. */
  function buildThemeControls() {
    var top = document.getElementById("themeControl");
    var chips = document.querySelector("[data-look-picker]");
    if (top) buildPicker(top);
    if (chips) buildChips(chips);
    return top || chips ? syncThemes : null;
  }

  /* A keyboard "click" has no pointer position, so the paper spreads from the
     middle of the control instead. */
  function originOf(e, el) {
    var box = el.getBoundingClientRect();
    return e.detail > 0 && (e.clientX || e.clientY)
      ? { x: e.clientX, y: e.clientY }
      : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  function swatchFor(t, withArt) {
    var s = document.createElement("span");
    s.className = "swatch";
    s.setAttribute("aria-hidden", "true");
    paintSwatch(s, t, withArt);
    return s;
  }
  function paintSwatch(s, t, withArt) {
    s.style.setProperty("--sw-paper", t.paper);
    s.style.setProperty("--sw-accent", t.accent);
    /* Absolute on purpose: a relative url() inside a custom property resolves
       against the stylesheet that uses it (assets/), not against this page. */
    if (withArt) s.style.setProperty("--sw-art", "url(\"" + new URL(LOOK_DIR + t.id + "-thumb.webp", document.baseURI).href + "\")");
  }

  /* Arrow keys move through a radio group; Home and End reach its ends. Up and
     Down always step, Left and Right follow the reading direction. */
  function radioKeys(e, items, onMove) {
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    var rtl = lang() === "ar", n = i;
    if (e.key === "ArrowRight") n += rtl ? -1 : 1;
    else if (e.key === "ArrowLeft") n += rtl ? 1 : -1;
    else if (e.key === "ArrowDown") n += 1;
    else if (e.key === "ArrowUp") n -= 1;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = items.length - 1;
    else return;
    e.preventDefault();
    n = (n + items.length) % items.length;
    items[n].focus();
    if (onMove) onMove(items[n]);
  }

  function buildPicker(host) {
    host.hidden = false;
    host.className = "picker";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tool look-btn";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    var sw = swatchFor(currentTheme(), false);
    var name = document.createElement("span");
    name.className = "look-name";
    btn.appendChild(sw);
    btn.appendChild(name);
    btn.insertAdjacentHTML("beforeend",
      '<svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>');

    var menu = document.createElement("div");
    menu.className = "look-menu";
    menu.setAttribute("role", "radiogroup");
    menu.hidden = true;

    var items = THEMES.map(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "look-item";
      b.setAttribute("role", "radio");
      b.setAttribute("data-theme-pick", t.id);
      var label = document.createElement("span");
      b.appendChild(swatchFor(t, true));
      b.appendChild(label);
      b.insertAdjacentHTML("beforeend",
        '<svg class="tick" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l5 5L19 7"></path></svg>');
      b.addEventListener("click", function (e) {
        var origin = originOf(e, b);
        close(true);
        switchTheme(t.id, origin);
      });
      menu.appendChild(b);
      return { el: b, label: label, theme: t };
    });
    var els = items.map(function (x) { return x.el; });

    function open() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      var cur = menu.querySelector('[aria-checked="true"]') || els[0];
      cur.focus();
    }
    function close(refocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (refocus) btn.focus();
    }
    btn.addEventListener("click", function () { if (menu.hidden) open(); else close(false); });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Tab") { close(e.key === "Escape"); return; }
      radioKeys(e, els);
    });
    /* A press anywhere else puts the menu away, as a menu should. */
    document.addEventListener("pointerdown", function (e) {
      if (!host.contains(e.target)) close(false);
    });

    host.appendChild(btn);
    host.appendChild(menu);

    themeSyncs.push(function () {
      var l = lang(), cur = currentTheme();
      paintSwatch(sw, cur, false);
      name.textContent = cur.name[l];
      btn.setAttribute("aria-label", T[l].pick + ": " + cur.name[l]);
      menu.setAttribute("aria-label", T[l].looks);
      items.forEach(function (it) {
        it.label.textContent = it.theme.name[l];
        var on = it.theme.id === cur.id;
        it.el.setAttribute("aria-checked", on ? "true" : "false");
        it.el.tabIndex = on ? 0 : -1;
      });
    });
  }

  /* The chips show each look as the application itself wearing it: a small
     crop of its library, its name and its accent. Hovering one fetches its
     screens ahead of the click, so the swap below is already in hand. */
  function buildChips(host) {
    host.hidden = false;
    host.setAttribute("role", "radiogroup");
    var items = THEMES.map(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "look-chip";
      b.setAttribute("role", "radio");
      b.setAttribute("data-theme-pick", t.id);
      b.style.setProperty("--sw-paper", t.paper);
      b.style.setProperty("--sw-accent", t.accent);
      var img = document.createElement("img");
      img.src = LOOK_DIR + t.id + "-thumb.webp";
      img.width = 320; img.height = 200;
      img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      var label = document.createElement("span");
      var dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      var text = document.createElement("b");
      label.appendChild(dot);
      label.appendChild(text);
      b.appendChild(img);
      b.appendChild(label);
      b.addEventListener("click", function (e) { switchTheme(t.id, originOf(e, b)); });
      b.addEventListener("pointerenter", function () { preloadLook(t.id); });
      b.addEventListener("focus", function () { preloadLook(t.id); });
      host.appendChild(b);
      return { el: b, text: text, theme: t };
    });
    var els = items.map(function (x) { return x.el; });
    host.addEventListener("keydown", function (e) { radioKeys(e, els, function (el) { el.click(); }); });

    themeSyncs.push(function () {
      var l = lang(), cur = currentTheme();
      host.setAttribute("aria-label", T[l].looks);
      items.forEach(function (it) {
        it.text.textContent = it.theme.name[l];
        var on = it.theme.id === cur.id;
        it.el.setAttribute("aria-checked", on ? "true" : "false");
        it.el.tabIndex = on ? 0 : -1;
      });
    });
  }

  /* ═══ THE LOOKS, WORN ═════════════════════════════════════════════════════
     The two screens under the chips are the application wearing the chosen
     look, in the reader's own interface language: its library, and a page of a
     book laid over the corner. They swap with a short fade when the look or the
     language changes, and the line under them says what the look is. */
  function lookSrc(id, view, l, small) {
    return LOOK_DIR + id + "-" + view + "-" + l + (small ? "-800" : "") + ".webp";
  }
  var preloaded = {};
  function preloadLook(id) {
    var l = lang(), small = innerWidth < 900;
    ["library", "reading"].forEach(function (view) {
      var url = lookSrc(id, view, l, small);
      if (preloaded[url]) return;
      preloaded[url] = true;
      var img = new Image();
      img.src = url;
    });
  }

  function buildLooks() {
    var box = document.querySelector("[data-looks]");
    if (!box) return;
    var shots = Array.prototype.slice.call(box.querySelectorAll("[data-look-shot]"));
    var note = box.querySelector("[data-look-note]");
    var shown = null;

    function load(img, t, l, view) {
      view = view || img.getAttribute("data-look-shot");
      img.srcset = lookSrc(t.id, view, l, true) + " 800w, " + lookSrc(t.id, view, l, false) + " 1600w";
      img.src = lookSrc(t.id, view, l, false);
      img.alt = T[l].shot[view].replace("{look}", t.name[l]);
    }

    /* NEVER AN EMPTY FRAME. The next screen is loaded into a layer over the
       current one and fades in only once it is decoded; then the screen beneath
       takes the same picture and the layer steps aside. A newer choice made
       meanwhile simply wins — `token` tells every older step to stand down. */
    var token = 0;
    function decoded(img) {
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    }
    function swap(img, t, l, mine) {
      var frame = img.parentNode;
      var next = frame.querySelector(".look-next");
      if (!next) {
        next = document.createElement("img");
        next.className = "look-next";
        next.alt = "";
        next.setAttribute("aria-hidden", "true");
        next.sizes = img.sizes;
        next.width = img.width; next.height = img.height;
        frame.appendChild(next);
      }
      next.classList.remove("is-in");
      load(next, t, l, img.getAttribute("data-look-shot"));
      next.alt = "";
      decoded(next).then(function () {
        if (mine !== token) return;
        next.classList.add("is-in");
        setTimeout(function () {
          if (mine !== token) return;
          load(img, t, l);
          decoded(img).then(function () {
            if (mine === token) next.classList.remove("is-in");
          });
        }, prefersReduced() ? 0 : 420);
      });
    }

    function sync() {
      var t = currentTheme(), l = lang(), key = t.id + "/" + l;
      if (key === shown) return;
      var first = shown === null;
      shown = key;
      var mine = ++token;
      shots.forEach(function (img) {
        if (first) load(img, t, l);
        else swap(img, t, l, mine);
      });
      if (note) {
        note.textContent = "";
        var b = document.createElement("b");
        b.textContent = t.name[l] + (l === "ar" ? ". " : ". ");
        note.appendChild(b);
        note.appendChild(document.createTextNode(t.note[l]));
      }
    }
    themeSyncs.push(sync);
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
    addEventListener("hashchange", go);
    if (location.hash) setTimeout(go, 60);
    return function () {
      Array.prototype.forEach.call(document.querySelectorAll(".anchor"), function (a) {
        a.setAttribute("aria-label", T[lang()].anchor);
      });
    };
  }

  /* ═══ THE LATEST RELEASE ══════════════════════════════════════════════════
     Every download link on the page points at the latest release page, which
     always works. When GitHub's API can be reached, the script swaps in the
     newest installer itself, so one click downloads it, and fills in the
     version, its size, its date and the headings of its notes.

     The asset names carry the version (Sard_1.4.1_x64-setup.exe), so a fixed
     /releases/latest/download/<name> link cannot exist; the API is what knows
     the current name. It allows 60 unauthenticated requests an hour per
     visitor, so the answer is kept for half an hour and reused across pages.
     Only URLs inside this one repository's releases are ever accepted. */
  var APP_REPO = "Limitless-Soul1/Sard";
  var RELEASE_API = "https://api.github.com/repos/" + APP_REPO + "/releases/latest";
  var RELEASE_PAGE = "https://github.com/" + APP_REPO + "/releases/";
  var ASSET_ROOT = RELEASE_PAGE + "download/";
  var RELEASE_KEY = "sard-legal-release";
  var RELEASE_TTL = 30 * 60 * 1000;

  var D = {
    en: { mb: "MB", started: "Sard {v} is downloading — open the installer when it finishes." },
    ar: { mb: "ميغابايت", started: "يجري تنزيل سَرْد {v}، افتح برنامج التثبيت حين يكتمل." }
  };

  function langOf(el) { return el.closest(".lang-ar") ? "ar" : "en"; }

  function pickAsset(assets, pattern) {
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      if (a && pattern.test(a.name) && typeof a.browser_download_url === "string" &&
          a.browser_download_url.indexOf(ASSET_ROOT) === 0) {
        return { name: a.name, size: a.size, url: a.browser_download_url };
      }
    }
    return null;
  }

  /* Keeps only what the page uses, which is also what gets cached. */
  function slimRelease(r) {
    if (!r || r.draft || r.prerelease || !r.assets) return null;
    var exe = pickAsset(r.assets, /x64-setup\.exe$/i) || pickAsset(r.assets, /\.exe$/i);
    if (!exe) return null;
    var page = typeof r.html_url === "string" && r.html_url.indexOf(RELEASE_PAGE) === 0 ? r.html_url : null;
    return {
      version: String(r.tag_name || "").replace(/^v/i, ""),
      page: page,
      date: r.published_at || null,
      body: typeof r.body === "string" ? r.body.slice(0, 20000) : "",
      exe: exe,
      msi: pickAsset(r.assets, /\.msi$/i)
    };
  }

  function loadRelease(done) {
    var cached = null;
    try { cached = JSON.parse(read(RELEASE_KEY) || "null"); } catch (e) { drop(RELEASE_KEY); }
    var fresh = cached && cached.release && Date.now() - cached.at < RELEASE_TTL;
    if (fresh) { done(cached.release); return; }
    if (!window.fetch) return;

    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl && setTimeout(function () { ctl.abort(); }, 8000);
    fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" }, signal: ctl ? ctl.signal : undefined })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (json) {
        var rel = slimRelease(json);
        if (!rel) throw new Error("no installer");
        write(RELEASE_KEY, JSON.stringify({ at: Date.now(), release: rel }));
        done(rel);
      })
      /* Rate-limited or offline: a stale answer is still better than none, and
         with no answer at all the links simply stay on the release page. */
      .catch(function () { if (cached && cached.release) done(cached.release); })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  /* Binary megabytes, because that is what Windows shows for the file. */
  function formatSize(bytes, l) {
    if (!(bytes > 0)) return "";
    return (bytes / 1048576).toFixed(1) + " " + D[l].mb;
  }

  /* Arabic keeps Western digits, as the documents' own dates do. */
  function formatDate(iso, l) {
    var d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(l === "ar" ? "ar-u-nu-latn" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" }).format(d);
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  /* The release notes are written as short titled paragraphs, English first,
     then a line holding only "⁂", then the same in Arabic. The titles are what
     the panel lists. Notes written another way yield nothing rather than a
     guess, and the panel keeps its plain sentence. */
  function highlights(body, l) {
    var parts = String(body || "").replace(/\r\n?/g, "\n").split(/\n[ \t]*⁂[ \t]*\n/);
    var text = l === "ar" ? parts[1] : parts[0];
    if (!text) return [];
    var out = [];
    text.split(/\n[ \t]*\n/).forEach(function (chunk) {
      var lines = chunk.trim().split("\n");
      if (lines.length < 2) return;
      var title = lines[0].replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      if (!title || title.length > 70 || /[.:;,،؛]$/.test(title)) return;
      out.push(title);
    });
    return out.slice(0, 5);
  }

  function fillRelease(rel) {
    each("[data-download]", function (a) {
      a.href = rel.exe.url;
      a.title = rel.exe.name;
      a.setAttribute("data-ready", "");
    });
    if (rel.msi) each("[data-download-msi]", function (a) { a.href = rel.msi.url; a.title = rel.msi.name; });
    if (rel.page) each("[data-release-notes]", function (a) { a.href = rel.page; });

    each("[data-release]", function (el) {
      var l = langOf(el), key = el.getAttribute("data-release");
      el.textContent = key === "version" ? rel.version
        : key === "size" ? formatSize(rel.exe.size, l)
        : key === "date" ? formatDate(rel.date, l) : "";
    });
    each("[data-release-show]", function (el) {
      var filled = el.querySelector("[data-release]") || el;
      if (filled.textContent) el.hidden = false;
    });

    each("[data-release-list]", function (list) {
      var items = highlights(rel.body, langOf(list));
      if (!items.length) return;
      list.textContent = "";
      items.forEach(function (title, i) {
        var li = document.createElement("li");
        li.textContent = title;
        li.style.setProperty("--i", i);
        list.appendChild(li);
      });
      list.hidden = false;
      var fallback = list.parentNode.querySelector("[data-release-fallback]");
      if (fallback) fallback.hidden = true;
    });
  }

  function buildRelease() {
    var buttons = document.querySelectorAll("[data-download]");
    if (!buttons.length) return;

    /* Once the link is the installer itself, the click starts a download and
       the page stays put, so it says so — otherwise nothing seems to happen. */
    Array.prototype.forEach.call(buttons, function (a) {
      var timer;
      a.addEventListener("click", function (e) {
        if (!a.hasAttribute("data-ready") || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var l = langOf(a);
        var block = a.closest(".lang-en, .lang-ar") || a.parentNode;
        var note = block.querySelector("[data-download-note]");
        var version = (block.querySelector('[data-release="version"]') || {}).textContent || "";
        a.classList.add("is-started");
        clearTimeout(timer);
        timer = setTimeout(function () { a.classList.remove("is-started"); }, 2600);
        if (note) {
          note.textContent = D[l].started.replace("{v}", version).replace("  ", " ");
          note.classList.add("is-on");
        }
      });
    });

    loadRelease(fillRelease);
  }

  /* ═══ THE TOUR ════════════════════════════════════════════════════════════
     Real screens from the application, one at a time, chosen by tabs. Without
     script the first screen shows on its own and the tabs never appear. The
     selected tab sits on a sliding piece of paper, like the theme control. */
  function buildTour() {
    var tour = document.querySelector("[data-tour]");
    if (!tour) return;
    var list = tour.querySelector(".tour-tabs");
    var tabs = Array.prototype.slice.call(tour.querySelectorAll(".tour-tab"));
    var shots = Array.prototype.slice.call(tour.querySelectorAll(".tour-shot"));
    var notes = Array.prototype.slice.call(tour.querySelectorAll(".tour-note"));
    if (!list || !tabs.length) return;

    var pill = document.createElement("i");
    pill.className = "tour-pill";
    pill.setAttribute("aria-hidden", "true");
    list.insertBefore(pill, list.firstChild);
    list.hidden = false;
    tour.classList.add("is-live");
    var current = 0;

    function place() {
      var t = tabs[current];
      if (!t.offsetWidth) return;
      /* Both axes, because on a phone the tabs wrap onto a second row. */
      pill.style.width = t.offsetWidth + "px";
      pill.style.height = t.offsetHeight + "px";
      pill.style.transform = "translate(" + t.offsetLeft + "px," + t.offsetTop + "px)";
    }

    function show(n, byUser) {
      current = n;
      var id = tabs[n].getAttribute("aria-controls");
      tabs.forEach(function (t, i) {
        t.setAttribute("aria-selected", i === n ? "true" : "false");
        t.tabIndex = i === n ? 0 : -1;
      });
      shots.forEach(function (s) { s.classList.toggle("is-active", s.id === id); });
      notes.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-for") === id); });
      place();
      if (byUser) tabs[n].scrollIntoView({ block: "nearest", inline: "nearest", behavior: prefersReduced() ? "auto" : "smooth" });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i, true); });
    });
    list.addEventListener("keydown", function (e) {
      var rtl = lang() === "ar";
      var n = current;
      if (e.key === "ArrowRight") n += rtl ? -1 : 1;
      else if (e.key === "ArrowLeft") n += rtl ? 1 : -1;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      else return;
      e.preventDefault();
      n = (n + tabs.length) % tabs.length;
      show(n, true);
      tabs[n].focus();
    });

    function sync() {
      list.setAttribute("aria-label", T[lang()].screens);
      place();
    }
    sync();
    /* The pill only learns to slide once it has been put in place, so it does
       not fly in from the corner when the page opens. */
    requestAnimationFrame(function () { pill.classList.add("is-placed"); });
    addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return sync;
  }

  /* ═══ ARRIVAL, WIRED ══════════════════════════════════════════════════════
     A group marked `data-reveal` arrives once, when it first reaches the
     reader; its `data-r` parts follow one another in reading order. Both
     languages are counted separately, so the Arabic arrives in the same
     rhythm as the English, and parts outside either language follow both. */
  function buildReveal() {
    revealWired = true;
    if (!root.classList.contains("reveal")) return;
    var groups = document.querySelectorAll("[data-reveal]");

    Array.prototype.forEach.call(groups, function (g) {
      var count = { en: 0, ar: 0 };
      Array.prototype.forEach.call(g.querySelectorAll("[data-r]"), function (el) {
        var l = el.closest(".lang-ar") ? "ar" : el.closest(".lang-en") ? "en" : null;
        var i;
        if (l) i = count[l]++;
        else { i = Math.max(count.en, count.ar); count.en = count.ar = i + 1; }
        el.style.setProperty("--i", i);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -2% 0px" });
    Array.prototype.forEach.call(groups, function (g) { io.observe(g); });
  }

  /* The bar gains a shadow once the page moves under it, and only then. */
  function buildChrome() {
    var bar = document.querySelector(".chrome");
    if (!bar) return;
    var stuck = null;
    function check() {
      var on = (window.scrollY || document.documentElement.scrollTop) > 4;
      if (on !== stuck) { stuck = on; bar.classList.toggle("is-stuck", on); }
    }
    addEventListener("scroll", check, { passive: true });
    check();
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
    var syncTheme = buildThemeControls();
    buildLooks();
    syncThemes();
    var syncAnchors = buildAnchors();
    var measureRail = buildRail();
    var syncTour = buildTour();
    buildRelease();
    buildChrome();
    buildReveal();
    /* Both languages of the report page are in the document at once, so each
       gets its own wired copy; only one is ever visible. */
    var updateReports = [buildReport("en"), buildReport("ar")].filter(Boolean);

    function switchLang() {
      applyLang(lang() === "ar" ? "en" : "ar");
      write(LANG_KEY, lang());
      if (syncTheme) syncTheme();
      if (syncAnchors) syncAnchors();
      if (syncTour) syncTour();
      updateReports.forEach(function (u) { u(); });
      /* The two languages are not the same length, so the scroll span moves. */
      if (measureRail) measureRail();
    }

    var langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        /* One language dissolves into the other rather than jumping. */
        if (document.startViewTransition && !prefersReduced()) document.startViewTransition(switchLang);
        else switchLang();
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
