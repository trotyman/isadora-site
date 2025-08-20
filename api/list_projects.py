import os
import json
from http.server import BaseHTTPRequestHandler

docs_dir = os.path.join(os.path.dirname(__file__), '..', 'docs')

def get_projects():
    projects = []
    if os.path.exists(docs_dir):
        for name in os.listdir(docs_dir):
            path = os.path.join(docs_dir, name)
            if os.path.isdir(path):
                images = [f for f in os.listdir(path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
                images = [f'/docs/{name}/{img}' for img in images]
                projects.append({
                    'name': name,
                    'images': images
                })
    return projects

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        projects = get_projects()
        self.wfile.write(json.dumps({'projects': projects}).encode())
