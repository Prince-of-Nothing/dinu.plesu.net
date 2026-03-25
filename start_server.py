#!/usr/bin/env python3
"""
Simple HTTP server starter for dinu.plesu.net
Serves the site at http://localhost:8080/
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

# Change to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
except OSError as e:
    if e.errno == 48 or e.errno == 98:  # Address already in use
        print(f"Error: Port {PORT} is already in use")
        print("Try killing the existing process or use a different port")
        sys.exit(1)
    else:
        raise
except KeyboardInterrupt:
    print("\nServer stopped")
    sys.exit(0)
