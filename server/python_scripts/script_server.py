import re #imports regExp
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
from python_scripts.summarizer import fetch_and_summarize
import time #for sleep and time-based dev functions

class app(BaseHTTPRequestHandler):
	def do_POST(self):

		if re.search('/s/summarizer', self.path):
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()
			content_len = int(self.headers.get('Content-Length',0))
			request_body = self.rfile.read(content_len)
			message = fetch_and_summarize(request_body)
			self.wfile.write(bytes(message, "utf8"))
		else:
			self.send_response(404)
			self.send_header('Content-type','text/html')
			self.end_headers()
			erMsg = "Er 404: Invalid endpoint"
			self.wfile.write(bytes(erMsg, "utf8"))
	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()
		self.wfile.write(bytes("allo","utf8"))

with HTTPServer(('', 42069), app) as server:
	server.serve_forever()
