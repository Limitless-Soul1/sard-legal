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
assets/sard.js      Language and theme switching
assets/fonts/       The application's own faces, subset to web weight
assets/sard-bird.png  The hoopoe mark
```

## Design

The pages are built from Sard's own design tokens rather than a separate visual identity, so they
read as part of the application:

- **Light is Ivory**, the application's default light theme; **dark is Charcoal**. Both are real Sard
  themes, taken from `src/theme/themes.ts` in the application repository — not approximations.
- The **desk-and-page** model: the browser background is the desk, the centred opaque sheet is the
  page, and the grain overlay sits on top of it.
- Typography is the application's: **IBM Plex Sans** and **IBM Plex Sans Arabic** for the interface,
  routed per script by `unicode-range`, with **Literata** for display. All three are OFL-licensed;
  the notices are kept beside the fonts in `assets/fonts/`.
- The visual source of truth is the Sard Theme Kit. Where these pages and the kit ever disagree, the
  kit is right.

## Bilingual, in one document

Both languages ship inside each page and are switched by the control in the top bar. This is
deliberate: it gives each document **one** address, which is what an external portal needs when it
asks for a single Terms URL and a single Privacy URL.

The root element carries `lang`, `dir` and `data-lang`; the stylesheet shows one language and hides
the other. With JavaScript disabled the English text is served, so the documents are never blank.

Arabic follows the application's own rules — it goes up one step in size and weight, it is never
uppercased or letterspaced, and the layout mirrors through logical properties. The hoopoe flips so
it always faces into the content; the wordmark's internal order never flips.

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
