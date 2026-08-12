# Sard — legal & public information pages

The Terms of Service and Privacy Policy for **Sard**, a desktop ebook reader for EPUB and PDF.

These pages are published so they can be linked from places that require a public HTTPS address for
each document — the Discord Developer Portal among them.

| Page | Address |
| --- | --- |
| Home | `/` |
| Terms of Service | `/terms.html` |
| Privacy Policy | `/privacy.html` |

This repository is **independent of the Sard application repository**. It holds no application code
and is not a dependency of the build.

---

## How it is put together

Three static pages, one stylesheet, one small script. No build step, no framework, no package
manager — editing a file and pushing it is the whole workflow.

```
index.html          Home — introduces Sard and links to both documents
terms.html          Terms of Service
privacy.html        Privacy Policy
assets/sard.css     Sard's design tokens and every component on these pages
assets/sard.js      Language, the theme organ, the reading rail, clause anchors
assets/fonts/       The application's own faces, subset to web weight
assets/sard-bird.png  The hoopoe mark
```

## Interaction

Four things move, and each earns its place. Everything else is static on purpose — these are legal
documents first.

- **The theme organ** in the top bar offers Sard's **sixteen real papers**. Choosing one repaints the
  whole site, because a theme in Sard is a token set rather than a skin — the page demonstrates that
  rather than asserting it. The values live in `THEMES` in `assets/sard.js` and are copied from
  `src/theme/themes.ts` in the application repository; `scratchpad/verify-themes.mjs` in the original
  working notes diffed all ten fields of all sixteen against the source. Do not hand-edit them.
  Unset means *follow the system*, which is the honest default; the menu's reset returns to it.
- **The reader specimen** on the home page shows the page resting on the desk, with a Latin line in
  Literata and an Arabic line in Amiri. It repaints with the organ, which is what makes the organ
  worth having. It is also the only place these pages show what Sard actually is.
- **The reading rail** is a two-pixel hairline of progress through the Terms and the Privacy Policy.
  It occupies no reading space and shifts nothing when it moves.
- **Clause anchors** make every numbered section linkable, because legal text gets quoted. A heading
  carries `data-section="7"` rather than an `id`: both languages are in the document at once, so an
  `id` would collide. The hash `#s7` is resolved against whichever language is showing, so one link
  serves both readers.

All four are progressive enhancements. With scripting off the organ is hidden, the rail and the
anchors never appear, and the documents read exactly as they always did.

## Design

The pages are built from Sard's own design tokens rather than a separate visual identity, so they
read as part of the application:

- **Light is Ivory**, the application's default light theme; **dark is Charcoal**. Both are real Sard
  themes, taken from `src/theme/themes.ts` in the application repository — not approximations.
- The **desk-and-page** model: the browser background is the desk, the centred opaque sheet is the
  page, and the grain overlay sits on top of it.
- Typography is the application's: **IBM Plex Sans** and **IBM Plex Sans Arabic** for the interface,
  routed per script by `unicode-range`, with **Literata** for display and **Amiri** for the Arabic
  line of the reader specimen. All are OFL-licensed; the notices are kept beside the fonts in
  `assets/fonts/`.
- The visual source of truth is the Sard Theme Kit. Where these pages and the kit ever disagree, the
  kit is right.

## Bilingual, in one document

Both languages ship inside each page and are switched by the control in the top bar. This is
deliberate: it gives each document **one** address, which is what an external portal needs when it
asks for a single Terms URL and a single Privacy URL.

The root element carries `lang`, `dir` and `data-lang`; the stylesheet shows one language and hides
the other. With JavaScript disabled the English text is served, so the documents are never blank.

Arabic follows the application's own rules — it goes up one step in size and weight, it is never
uppercased or letterspaced, and the layout mirrors through logical properties. The wordmark's
internal order never flips.

**The artwork never mirrors.** RTL moves the layout — the bar, the navigation, the cards, the text —
but the hoopoe keeps one fixed orientation in both languages, and no `transform: scaleX(-1)` may be
put back on it. A flipped mark is a different mark, and a reader switching language sees it change.
Directional UI, such as the chevron on a document card, does still mirror: it means *onward*, and
onward depends on the direction. Note that this is a **deliberate departure** from the Theme Kit,
which mirrors the bird inside the application so it faces into the content; the kit governs the
application, and this is the decision for this site.

A reader's language and theme choice is kept in `localStorage`. A link may also force a language
with `?lang=ar` or `?lang=en`.

## Rebuilding the fonts

The `.woff2` files are subsets of the faces bundled with the application, cut down to the Latin and
Arabic ranges these pages use — about 2 MB of TTF becomes about 320 KB. All OpenType shaping and
positioning features are kept, which Arabic needs to render at all.

They only need rebuilding if the pages start using a character outside the subset ranges. With
[fonttools](https://github.com/fonttools/fonttools) installed (`pip install "fonttools[woff]"`):

```
pyftsubset <source.ttf> --unicodes=<ranges> --layout-features='*' --flavor=woff2 \
  --desubroutinize --output-file=assets/fonts/<name>.woff2
```

**Amiri is the exception.** It sets exactly one line — the Arabic line of the reader specimen — so it
is cut to that line's characters with `--text=` rather than to the whole Arabic block, which costs
34 KB instead of 119 KB. **If you change the Arabic specimen text in `index.html`, the new characters
will not be in the font** and will fall back to a system face. Re-subset with the new string:

```
pyftsubset Amiri-Regular.ttf --text="<the specimen line>" --layout-features='*' \
  --flavor=woff2 --desubroutinize --output-file=assets/fonts/amiri-400.woff2
```

Dropping `--layout-features='*'` produces a font in which Arabic does not join at all. Always check a
subset with tashkīl before shipping it.

## Editing the documents

The text is plain HTML — edit it directly. When either document changes in substance, update the
version number and the date in the `.stamp` block at the top of that page, in **both** languages.

Anything that cannot be stated accurately is marked with a visible `TODO` block rather than filled
in with a guess. There is one open at the time of writing: the governing law in section 10 of the
Terms.

## Publishing

GitHub Pages serves the `main` branch from the repository root. Pushing to `main` republishes; there
is no workflow to wait on beyond the Pages deployment itself.

## Licence

The page text and design are © 2026 the Sard project. The bundled typefaces are licensed under the
SIL Open Font License 1.1 — see the notices in `assets/fonts/`.
