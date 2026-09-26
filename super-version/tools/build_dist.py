#!/usr/bin/env python3
"""Build dist/monkey-jockey.html: one file with CSS + JS inlined from index.html.
--inline-assets also embeds every "assets/..." file referenced from HTML/CSS/JS
(images AND videos) as base64 data URIs so the single file works on its own."""
import re, sys, base64, os, mimetypes
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
inline_assets = "--inline-assets" in sys.argv
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
def css(m):
    return "<style>\n" + open(os.path.join(ROOT, m.group(1)), encoding="utf-8").read() + "\n</style>"
def js(m):
    return "<script>\n" + open(os.path.join(ROOT, m.group(1)), encoding="utf-8").read().replace("</script", "<\\/script") + "\n</script>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<script src="([^"]+)"></script>', js, html)
missing, embedded = [], {}
if inline_assets:
    def data_uri(m):
        rel = m.group(2)
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p):
            missing.append(rel); return m.group(0)
        if rel not in embedded:
            mt = mimetypes.guess_type(p)[0] or "application/octet-stream"
            embedded[rel] = f"data:{mt};base64," + base64.b64encode(open(p, "rb").read()).decode()
        return m.group(1) + embedded[rel] + m.group(3)
    html = re.sub(r'(["\'`(])(assets/[A-Za-z0-9_\-./]+\.(?:png|webp|jpg|jpeg|svg|mp4|webm|json|mp3))(["\'`)])', data_uri, html)
os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
out = os.path.join(ROOT, "dist", "monkey-jockey.html")
open(out, "w", encoding="utf-8").write(html)
print(f"wrote {out} {os.path.getsize(out):,} B; embedded {len(embedded)} assets; missing {missing}")
