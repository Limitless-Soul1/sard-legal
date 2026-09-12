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
index.html          Home — introduces Sard, links to both documents, Get Sard, contact
terms.html          Terms of Service
privacy.html        Privacy Policy
report.html         Composes a report and hands it to GitHub prefilled
.github/ISSUE_TEMPLATE/  The issue forms those reports land in
assets/sard.css     Sard's design tokens and every component on these pages
assets/sard.js      Language, the theme control, the reading rail, clause anchors
assets/fonts/       The application's own faces, subset to web weight
assets/sard-bird.png  The hoopoe mark
```

## Interaction

Four things move, and each earns its place. Everything else is static on purpose — these are legal
documents first.

- **The theme control** in the top bar offers **two papers**: **Sard**, the default, and
  **Charcoal**, the night alternative. Both are defined in the stylesheet, so applying one is a single
  `data-theme` attribute and the tokens have exactly one home. Sard's values are the application's
  Ivory set (its `DEFAULT_LIGHT`), shown here under the product's own name.
  The site **always opens on Sard**, whatever the visitor's system is set to — there is deliberately
  no `prefers-color-scheme` default, because the opening paper is a decision rather than an
  inheritance. A chosen theme is remembered and carries across pages.
- **The reader specimen** on the home page shows the page resting on the desk, with a Latin line in
  Literata and an Arabic line in Amiri. It repaints with the theme, which is what makes the control
  worth having. It is also the only place these pages show what Sard actually is.
- **The reading rail** is a two-pixel hairline of progress through the Terms and the Privacy Policy.
  It occupies no reading space and shifts nothing when it moves.
- **Clause anchors** make every numbered section linkable, because legal text gets quoted. A heading
  carries `data-section="7"` rather than an `id`: both languages are in the document at once, so an
  `id` would collide. The hash `#s7` is resolved against whichever language is showing, so one link
  serves both readers.

All four are progressive enhancements. With scripting off the theme control is hidden, the site
renders in Sard, the rail and the anchors never appear, and the documents read exactly as they
always did.

## Reporting, and why the form does not submit

Everything reportable — bugs, feedback, questions, anything about the Terms or the Privacy Policy —
goes to **this repository's** tracker, `github.com/Limitless-Soul1/sard-legal/issues`. The links to
the LICENCE and the "project on GitHub" footer link still point at the application, because that is
where both of those actually live.

`report.html` composes a report in Sard's own interface and then hands it to GitHub's issue form
**with every field already filled in**, through query parameters. It does not post the issue itself.
That was a deliberate choice, not a shortcut:

- Posting directly needs a credential that can write to the repository. This site is static and
  entirely public, so that credential would have to live behind a serverless proxy — which then
  needs its own secret store, CORS rules, a captcha and a rate limiter, because it would be an
  anonymous write path into the repository that someone has to defend forever.
- It would make attachments **worse**. GitHub's REST API has no endpoint for uploading an issue
  attachment at all; the web composer uses an internal one. A proxy would have to put files in some
  other bucket and link to them. Handing off means drag-and-drop upload works properly, in the one
  place that can actually accept it.
- Issues would be authored by a bot rather than by the person reporting, so nobody could be replied
  to, and GitHub's own anti-abuse would no longer apply.

The cost is one extra click and a GitHub account. `Copy as text` covers anyone who does not want one.

**The field names are a contract.** The query parameters `description` and `details` in
`assets/sard.js` are the `id`s of the fields in `.github/ISSUE_TEMPLATE/*.yml`. Renaming a field in
one place without the other silently stops the prefill — the link still works, it just arrives
empty.


## Two rules the layout depends on

**Every inline `<svg>` carries `width` and `height` attributes.** A `viewBox` alone gives an SVG no
intrinsic size, so if the stylesheet does not arrive — a flaky connection, a blocker, a bad cache —
each icon expands to fill its container. Measured on this page before the fix: icons at **1264x1264**,
the Get Sard section at **5418px** instead of 320, and the document at **25565px** instead of 2595.
A CSS `width` always beats the attribute, so styled rendering is identical; the attribute only
decides what a reader sees when the CSS is missing. Do not remove them from new icons.

**Get Sard and Contact are a matched pair, not two stacked posters.** They sit side by side directly
under the document cards, so the four things a visitor needs — what Sard is, where to download it,
where the source is, where to report — are all within the first screen and a half. The mark in each
panel is a **40px supporting tile beside the content**, capped with `max-width`/`max-height` so it
cannot grow back into artwork; the heading, the sentence and the actions are the section. Actions run
primary -> ghost -> quiet, with exactly one accent-filled button on the page.

## Design

The pages are built from Sard's own design tokens rather than a separate visual identity, so they
read as part of the application:

- **Sard** (the default) is the application's Ivory token set, its `DEFAULT_LIGHT`; **Charcoal** is
  the night theme. Both are real Sard themes, taken from `src/theme/themes.ts` in the application
  repository — not approximations. The site offers these two and no others.
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
version number and the date in the `.stamp` block at the top of that page, in **both** languages,
**and** the matching `sard-legal-version` meta tag in that page's `<head>`.

### The revision, for programs

`revision.json` at the repository root names the current pair and is the single thing a program
should read:

```json
{ "revision": "terms-1.1+privacy-1.2", "documents": { "terms": { "version": "1.1" }, … } }
```

The combined `revision` string identifies the exact pair of documents a reader is asked to accept.
It changes whenever either document's version changes, so a stale pair can never look current.

Three places carry the same fact and must move together: the visible `.stamp` (for a person), the
`sard-legal-version` meta (for a program reading one page), and `revision.json` (for a program
reading the repository). The Sard application vendors a stamped snapshot rather than copying text,
so that it can state which revision it contains and fail loudly if the two ever disagree.

Anything that cannot be stated accurately is marked with a visible `TODO` block rather than filled
in with a guess. There are none open at the time of writing — the governing law in section 10 of the
Terms was the last, and it is now settled.

## Publishing

GitHub Pages serves the `main` branch from the repository root. Pushing to `main` republishes; there
is no workflow to wait on beyond the Pages deployment itself.

## Licence

The page text and design are © 2026 the Sard project. The bundled typefaces are licensed under the
SIL Open Font License 1.1 — see the notices in `assets/fonts/`.
