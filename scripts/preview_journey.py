#!/usr/bin/env python3
"""Preview only Phil's Journey without Ruby. Not a replacement for a Jekyll build."""
import argparse
import html
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def render_journey(baseurl=""):
    source = (ROOT / "journey.html").read_text(encoding="utf-8")
    _, metadata, content = source.split("---", 2)
    title = re.search(r"^title:\s*(.+)$", metadata, re.MULTILINE).group(1)
    layout = (ROOT / "_layouts/journey.html").read_text(encoding="utf-8")
    page = layout.replace("{{ content }}", content)
    page = page.replace("{{ page.title }}", html.escape(title))
    page = page.replace("{{ site.title }}", "Get To Know Phil")
    page = re.sub(
        r"\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}",
        lambda match: baseurl + match.group(1), page,
    )
    if "{{" in page or "{%" in page:
        raise ValueError("Preview encountered unsupported Liquid; use Jekyll for this page.")
    return page.encode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=4000, type=int)
    parser.add_argument("--baseurl", default="")
    args = parser.parse_args()
    baseurl = args.baseurl.rstrip("/")
    if baseurl and not re.fullmatch(r"/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*", baseurl):
        parser.error("baseurl must be a path such as /preview")

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.respond()

        def do_HEAD(self):
            self.respond(head=True)

        def respond(self, head=False):
            path = unquote(urlsplit(self.path).path)
            content_type = "text/html; charset=utf-8"
            try:
                if path in (baseurl + "/journey/", baseurl + "/journey"):
                    data = render_journey(baseurl)
                elif path == baseurl + "/":
                    data = ("<!doctype html><title>Journey preview</title>"
                            "<h1>Local journey preview</h1>"
                            f'<p><a href="{baseurl}/journey/">Start Phil’s Journey</a></p>'
                            '<p>This previews the game only. The main site needs Jekyll.</p>'
                            '<p><a href="https://codephilwrites.github.io/">Phil’s website</a></p>').encode("utf-8")
                elif path.startswith(baseurl + "/assets/journey/"):
                    asset_root = (ROOT / "assets/journey").resolve()
                    asset = (ROOT / path.removeprefix(baseurl).lstrip("/")).resolve()
                    if (not asset.is_relative_to(asset_root) or not asset.is_file()
                            or asset.suffix.lower() not in {".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}):
                        self.send_error(404)
                        return
                    data = asset.read_bytes()
                    content_type = mimetypes.guess_type(asset.name)[0] or "application/octet-stream"

                else:
                    self.send_error(404)
                    return
            except (OSError, ValueError):
                self.send_error(500, "Could not render journey; check the source files.")
                return
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if not head:
                self.wfile.write(data)

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Journey preview: http://{args.host}:{args.port}{baseurl}/journey/", flush=True)
    print("Game preview only; no Ruby required. Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
