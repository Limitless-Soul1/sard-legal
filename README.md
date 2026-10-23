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
index.html          Home — Sard, the download, the looks, the tour, both documents, what's new, contact
terms.html          Terms of Service
privacy.html        Privacy Policy
report.html         Composes a report and hands it to GitHub prefilled
.github/ISSUE_TEMPLATE/  The issue forms those reports land in
assets/sard.css     Sard's design tokens and every component on these pages
assets/sard.js      Language, the looks, the latest release, the tour, arrival, the reading rail,
                    clause anchors
assets/fonts/       The application's own faces, subset to web weight
assets/sard-bird.png  The hoopoe mark
assets/shots/       Screens from the application, for the tour on the home page
assets/looks/       The application in each look, the chip thumbnails, and the looks' paintings
tools/arabic-headings.py  Redraws the Arabic display headings (see below); not needed to publish
```

## Interaction

The legal documents stay still on purpose: on those pages only the theme control, the reading rail
and the clause anchors move. The home page is the product's front door as well, so it does a little
more, and each piece still has a job.

- **The look picker** in the top bar offers **six looks**: **Sard**, the default, **Charcoal**, the
  night paper, and four looks with pictures — **Ember & Iron**, **RedRose**, **Ninth Wave** and
  **Sierra**. Every look's colours are defined in the stylesheet under `data-theme-id`, so applying
  one is a single attribute and the tokens have exactly one home; `data-theme="dark"` adds what all
  the night papers share. A look with a picture shows it on the desk, behind the sheet, the way the
  application shows it behind the library.
  The site **always opens on Sard**, whatever the visitor's system is set to — there is deliberately
  no `prefers-color-scheme` default, because the opening paper is a decision rather than an
  inheritance. A chosen look is remembered and carries across pages.
  Where the browser has view transitions, the new paper **spreads from the point that was clicked**
  across the old one; elsewhere, and for anyone who asks for reduced motion, it simply changes.
  A change of mind never waits for the sweep: while one runs the browser sends every press to
  `<html>`, so a press during a sweep ends it and its click is replayed on whatever is really under
  the pointer.
  The top bar is **sticky** on wider screens, so the picker is always in reach; on a phone, where the
  bar is two rows, it scrolls away with the page.
- **The looks section**, directly under the masthead, is the same choice made large: a chip per look,
  and then the application itself wearing the chosen look — its library, with a page of a book laid
  over the corner — in the reader's interface language. Choosing a chip repaints the whole page as
  well, so the section shows what a look is by doing it. Hovering a chip fetches its screens ahead
  of the click, and the new screens are laid over the old ones and fade in only once decoded, so the
  frame is never empty between two looks. A note under the screens (`.look-own`) says plainly that
  every colour, the pictures behind the library and the page, the fonts and the marks are the
  reader's to set, and the result is theirs to keep or share. It does not call the looks on this
  page a starting set: apart from Sard and Charcoal they are not bundled with the application.
- **The reading rail** is a two-pixel hairline of progress through the Terms and the Privacy Policy.
  It occupies no reading space and shifts nothing when it moves.
- **Clause anchors** make every numbered section linkable, because legal text gets quoted. A heading
  carries `data-section="7"` rather than an `id`: both languages are in the document at once, so an
  `id` would collide. The hash `#s7` is resolved against whichever language is showing, so one link
  serves both readers.
- **The download** sits under the masthead's sentence and is the one accent-filled button on the
  page. It downloads the newest installer in one click — see below for how it knows which file that
  is. Once a download has started the button says so, because the page itself does not change.
- **The tour** shows what Sard does once a book is open — read aloud, notes, spoiler-safe search and
  photo cards — chosen by tabs, with a sliding piece of paper under the chosen tab. Where the browser
  supports scroll-driven animation, the screen tips up into place as it is scrolled to.
- **What's new** lists the headings of the latest release's own notes, in the reader's language.
- **Arrival.** The masthead arrives in a little over a second on load (pure CSS), and each section
  below rises into place once as it reaches the reader, its parts in reading order. The hoopoe
  keeps a slow breath afterwards — the one thing that moves on its own. Switching language
  cross-fades rather than jumps.

All of it is a progressive enhancement. With scripting off the look pickers are hidden, the site
renders in Sard and the looks section shows Sard's own screens, the rail and the anchors never
appear, the download links to the latest release page, the tour shows its first screen on its own,
and the documents read exactly as they always did.
The hidden starting state of an arriving section exists only under `html.reveal`, which the script
sets before first paint and takes off again if it never wires the observer, so a failure can never
leave content invisible. `prefers-reduced-motion` keeps every finished state and drops the travel.

## The download, and why it asks GitHub

The installer's file name carries the version — `Sard_1.4.1_x64-setup.exe` — so there is no fixed
`/releases/latest/download/<name>` address that always means "the newest installer". GitHub's API
is what knows the current name.

So every download link is written in the HTML as `github.com/Limitless-Soul1/Sard/releases/latest`,
which always works, and `assets/sard.js` then asks
`api.github.com/repos/Limitless-Soul1/Sard/releases/latest` and swaps in:

- the `x64-setup.exe` asset for the download buttons (`data-download`),
- the `.msi` asset for the MSI link (`data-download-msi`),
- the release's own page for "Release notes" (`data-release-notes`),
- the version, the installer's size and the release date (`data-release="version|size|date"`),
- the headings of the release notes for What's new (`data-release-list`).

Publishing a new release in the application repository therefore updates this site with no change
here. Drafts and pre-releases are never offered, because the API's `latest` excludes them.

A few things keep it safe and cheap:

- **Only URLs inside `github.com/Limitless-Soul1/Sard/releases/` are accepted.** Anything else in
  the response is ignored and the link stays on the release page.
- **The answer is kept for half an hour** in `localStorage` and reused across pages. Unauthenticated
  API calls are limited to 60 an hour per visitor; one page view costs at most one.
- **Failure is silent.** Offline, rate-limited or slow (eight seconds), the page uses a stale cached
  answer if it has one and otherwise leaves the links on the release page.
- Everything taken from the release is set with `textContent`, never as HTML.

**The release notes are a format.** What's new reads the notes as short titled paragraphs — a
heading line, then its paragraph, separated by blank lines — with the English first, a line holding
only `⁂`, and then the Arabic. Notes written another way are not guessed at: the list stays hidden
and the panel keeps its plain sentence. If the asset naming ever changes, `pickAsset` in
`assets/sard.js` is the one place that needs to know.

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

**The download is on the first screen, and it is the only accent-filled button.** It sits directly
under the sentence that says what Sard is, so what Sard is and how to get it are read together.
Every other action on the page is ghost or quiet.

**What's new and Contact are a matched pair, not two stacked posters.** They sit side by side under
the document cards. The mark in each panel is a **40px supporting tile beside the content**, capped
with `max-width`/`max-height` so it cannot grow back into artwork; the heading, the sentence and the
actions are the section. Actions run ghost -> quiet.

**Component rules are scoped through their container** — `.cards .card h2`, `.panels .panel p`,
`.tour .tour-note`. These all sit inside `.doc`, whose `h2`, `p` and `a` rules would otherwise win on
order and give a card title a section heading's size and margin, or paint a whole card in the link
colour. Do not shorten these selectors.

## Design

The pages are built from Sard's own design tokens rather than a separate visual identity, so they
read as part of the application:

- **Sard** (the default) is the application's Ivory token set, its `DEFAULT_LIGHT`; **Charcoal** is
  the night theme. Both are real Sard themes, taken from `src/theme/themes.ts` in the application
  repository — not approximations. The other four are real looks too, each with the eight colours of
  its own profile; where a look's accent is too dark or too light to read as text on its own paper
  it also names `--accent-ink` (for text) and `--on-accent` (for a label on an accent fill).
- The **desk-and-page** model: the browser background is the desk, the centred opaque sheet is the
  page, and the grain overlay sits on top of it.
- Typography is the application's: **IBM Plex Sans** and **IBM Plex Sans Arabic** for the interface,
  routed per script by `unicode-range`, with **Literata** for display. All are OFL-licensed; the
  notices are kept beside the fonts in `assets/fonts/`. The Arabic display headings are drawn — see
  the next section.
- The visual source of truth is the Sard Theme Kit. Where these pages and the kit ever disagree, the
  kit is right.

## The Arabic display headings

The Arabic headings — the masthead line, the section headings, the card and panel titles — are set
in **Thmanyah Serif Display Bold**, with the face's own long swash finals (`ss01`) on chosen words, so
the endings of words like «تبقى» and «جهازك» sweep out.

They are **drawn, not served as a webfont**, and that is a licensing decision rather than a
technical one. Thmanyah's licence allows the face in websites and design work, but forbids hosting
the font file or making it available in any way a visitor could extract it — which a `.woff2` on a
public site is. So `tools/arabic-headings.py` shapes each heading with HarfBuzz and writes it into
the page as one SVG path. No font file is published; the real text sits beside each drawing (`.vh`)
for screen readers, search and copying, and the drawing takes its colour from `currentColor`, so it
repaints with every look. The masthead line has a second, two-line drawing for narrow screens.

To change a heading, edit its text inside `<span class="vh">`, then redraw:

```
pip install fonttools uharfbuzz
python tools/arabic-headings.py --font "<path to thmanyahserifdisplay-Bold.otf>" index.html
```

`data-swash` on the heading names the words (0-based) whose finals take the swash; `data-break` on
the masthead names the word the narrow version breaks before.

**Milan Display is not used.** Its embedded licence reads "Free for personal use only, modification
is not allowed", and its embedding flags forbid subsetting, so it can neither appear on a public site
nor be merged with another face. Thmanyah's own swash set gives the long endings without it. If a
commercial licence for Milan that allows web use and modification is ever obtained, the drawing tool
is the place to bring it in.

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

A reader's language and look are kept in `localStorage`. A link may also force a language
with `?lang=ar` or `?lang=en`.

## The screens in the tour

`assets/shots/` holds screens from the application repository's `docs/screenshots/`, cropped to
16:10 and saved as WebP at two widths: the full one (at most 1600px) and an `-800` one for phones,
chosen by `srcset`. Every one is lazy-loaded.

| File | Source |
| --- | --- |
| `listen` | `in-book-en-with-background-and-TTS-working.png` |
| `notes` | `notes.png` |
| `search` | `search-feature.png` |
| `cards` | `quote.png` |

The frame is 16:10 whatever the source, so switching tabs never moves the page. A replacement should
be cropped to the same ratio.

## The looks, and how their screens were made

`assets/looks/` holds, for each look id (`sard`, `charcoal`, `ember`, `redrose`, `ninthwave`,
`sierra`):

- `<id>-library-<en|ar>.webp` and `<id>-reading-<en|ar>.webp` — the application wearing the look, at
  1600x1000, with an `-800` copy of each for phones;
- `<id>-thumb.webp` — the chip, a 320x200 crop of the English library;
- `art-<id>.webp` — the look's picture for the desk, for the four looks that have one.

Only the chosen look's files are ever fetched. The screens were taken from a development build of
the application running on a **throwaway library**: `SARD_DATA_DIR` (honoured only by debug builds)
and `WEBVIEW2_USER_DATA_FOLDER` point it at empty folders, so a real library is never opened. The
books in them are public-domain: *Alice's Adventures in Wonderland*, *Dracula* and *The Count of
Monte Cristo* in their Standard Ebooks editions, and classical Arabic texts — «رسالة الغفران»،
«مقدمة ابن خلدون»، «تلخيص السفسطة»، «الضروري في المنطق».

**The pictures.** Ninth Wave is built on Ivan Aivazovsky's *The Ninth Wave* (1850) and Sierra on
Albert Bierstadt's *Among the Sierra Nevada, California* (1868), both public domain via Wikimedia
Commons and credited in the footer. Ember & Iron and RedRose carry the pictures of the looks they
were made from; keep the rights to those in mind before swapping in anything else.

To add a look: give it a token block under `:root[data-theme-id="<id>"]` in `assets/sard.css`
(plus the `:is(...)` lists there if it has a picture), an entry in `THEMES` in `assets/sard.js`, and
the files above.

## Rebuilding the fonts## Rebuilding the fonts

The `.woff2` files are subsets of the faces bundled with the application, cut down to the Latin and
Arabic ranges these pages use — about 2 MB of TTF becomes about 320 KB. All OpenType shaping and
positioning features are kept, which Arabic needs to render at all.

They only need rebuilding if the pages start using a character outside the subset ranges. With
[fonttools](https://github.com/fonttools/fonttools) installed (`pip install "fonttools[woff]"`):

```
pyftsubset <source.ttf> --unicodes=<ranges> --layout-features='*' --flavor=woff2 \
  --desubroutinize --output-file=assets/fonts/<name>.woff2
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
