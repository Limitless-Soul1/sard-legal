"""Draw the Arabic display headings as outlines.

The Arabic headings on these pages are set in Thmanyah Serif Display Bold, with the face's own
swash finals on chosen words. The face's licence allows it in websites and design work but forbids
hosting the font file or making it extractable, so no font file is published: each heading is shaped
here and written into the page as one SVG path, with the real text beside it for screen readers,
search and copying.

A drawn heading is marked up like this, and this script rewrites everything between the markers:

    <span class="ar-type" data-swash="1 4" data-break="3"><span class="vh">النص</span>…</span><!--/ar-->

  data-swash   word positions (0-based, in reading order) whose final letter takes the swash form
  data-break   optional: draw a second, two-line version for narrow screens, breaking before this word

To change a heading, edit the text inside `vh`, then run:

    pip install fonttools uharfbuzz
    python tools/arabic-headings.py --font "<path to thmanyahserifdisplay-Bold.otf>" index.html

The font stays on your own machine; only the drawn shapes reach the repository.
"""
import argparse
import io
import re

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

SWASH = "ss01"  # Thmanyah's long finals; `swsh` maps to the same forms
ASC, DESC = 1000, 420  # the fixed line box, in font units, so every heading shares one baseline
ATTR_H = 40  # the size the SVG falls back to if the stylesheet never arrives

MARK = re.compile(
    r'<span class="ar-type" data-swash="(?P<swash>[^"]*)"(?: data-break="(?P<brk>\d+)")?>'
    r'<span class="vh">(?P<text>[^<]*)</span>.*?</span><!--/ar-->',
    re.S,
)


class Shaper:
    def __init__(self, path):
        self.tt = TTFont(path)
        self.glyphs = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()
        self.font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
        self.upm = self.tt["head"].unitsPerEm

    def draw(self, text, swash_words):
        spans = [(m.start(), m.end()) for m in re.finditer(r"\S+", text)]
        ranges = [(spans[i][0], spans[i][1], True) for i in swash_words if i < len(spans)]
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, {SWASH: ranges} if ranges else {})

        parts, x = [], 0
        bounds = BoundsPen(self.glyphs)
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            glyph = self.glyphs[self.order[info.codepoint]]
            # Font units run y-up and SVG runs y-down, so each glyph is flipped about the baseline.
            flip = (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)
            pen = SVGPathPen(self.glyphs, ntos=lambda v: "%d" % round(v))
            glyph.draw(TransformPen(pen, flip))
            if pen.getCommands():
                parts.append(pen.getCommands())
            glyph.draw(TransformPen(bounds, flip))
            x += pos.x_advance

        xmin, ymin, xmax, ymax = bounds.bounds
        pad = round(self.upm * 0.06)
        vb = [round(xmin) - pad, -ASC, round(xmax - xmin) + 2 * pad, ASC + DESC]
        # A swash that sweeps further than the line box is still kept inside it.
        if ymin < vb[1]:
            vb[3] += vb[1] - round(ymin) + pad
            vb[1] = round(ymin) - pad
        if ymax > vb[1] + vb[3]:
            vb[3] = round(ymax) - vb[1] + pad
        return " ".join(parts), vb


def svg(d, vb, cls):
    aspect = round(vb[2] / vb[3], 4)
    return (
        f'<svg class="{cls}" width="{round(aspect * ATTR_H)}" height="{ATTR_H}" '
        f'viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" style="--a:{aspect}" aria-hidden="true" focusable="false">'
        f'<path fill="currentColor" d="{d}"></path></svg>'
    )


def render(shaper, m):
    text = m.group("text").strip()
    swash = [int(n) for n in m.group("swash").split()]
    # The full stop belongs to the sentence a screen reader hears, not to the drawn display line.
    drawn = text.rstrip(".")
    out = svg(*shaper.draw(drawn, swash), "ar-display" + (" ar-wide" if m.group("brk") else ""))
    if m.group("brk"):
        words = drawn.split()
        cut = int(m.group("brk"))
        first, second = " ".join(words[:cut]), " ".join(words[cut:])
        out += '<span class="ar-narrow">'
        out += svg(*shaper.draw(first, [i for i in swash if i < cut]), "ar-display")
        out += svg(*shaper.draw(second, [i - cut for i in swash if i >= cut]), "ar-display")
        out += "</span>"
    brk = f' data-break="{m.group("brk")}"' if m.group("brk") else ""
    return (f'<span class="ar-type" data-swash="{m.group("swash")}"{brk}>'
            f'<span class="vh">{m.group("text")}</span>{out}</span><!--/ar-->')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--font", required=True, help="path to thmanyahserifdisplay-Bold.otf")
    ap.add_argument("pages", nargs="+")
    args = ap.parse_args()
    shaper = Shaper(args.font)
    for page in args.pages:
        html = io.open(page, encoding="utf-8").read()
        new, n = MARK.subn(lambda m: render(shaper, m), html)
        io.open(page, "w", encoding="utf-8", newline="\n").write(new)
        print(f"{page}: {n} heading(s) drawn")


if __name__ == "__main__":
    main()
