#!/usr/bin/env python3
"""
Simple web server for Image Analysis & Tagging System
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent


class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler with CORS support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


def main():
    """Start the web server"""
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"\n{'='*60}")
            print(f"Image Analysis & Tagging System - Server Starting")
            print(f"{'='*60}")
            print(f"\n  Server running at: http://localhost:{PORT}")
            print(f"  Directory: {DIRECTORY}")
            print(f"\n  Open http://localhost:{PORT} in your browser")
            print(f"\n  Press Ctrl+C to stop the server\n")
            print(f"{'='*60}\n")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print(f"Try using a different port or stop the process using port {PORT}")
            sys.exit(1)
        else:
            raise


if __name__ == '__main__':
    main()
