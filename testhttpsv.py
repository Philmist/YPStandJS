# fileencoding=utf-8

import http.server
import sys

def run(server_class=http.server.HTTPServer, handler_class=http.server.BaseHTTPRequestHandler):
    """Run HTTPserver at localhost:8080.
    """
    server_address = ('', 8080)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

class StreamRequestHandler(http.server.BaseHTTPRequestHandler):
    """Output eternal "X"."""
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        while True:
            self.wfile.write(bytes("X", 'utf-8'))
        return

if __name__ == "__main__":
    print("Starting server...")
    try:
        run(handler_class=StreamRequestHandler)
    except KeyboardInterrupt:
        print("\nKeyboard intterupt.\n")
        sys.exit(0)

