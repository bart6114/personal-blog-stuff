#!/usr/bin/env python3
"""Dev server for gpx-story: http.server with caching disabled, so edits to
the demo/library show up on plain reload (python's default server sends no
cache headers and browsers heuristically cache everything, phones included).

Usage: python3 tools/serve.py [port]   (run from the gpx-story root)
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8734
http.server.ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
