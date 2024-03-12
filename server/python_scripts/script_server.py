import json #json library
import re #imports regExp
import mysql.connector #for mySQL functionality
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
from summarizer import handle_url
import time #for sleep and time-based dev functions

sumDB = mysql.connector.connect(
	host="localhost",
	user="cosc4p02",
	password="summarizeme",
	database="summarizer"
)

dbCursor = sumDB.cursor()

class app(BaseHTTPRequestHandler):
	def do_POST(self):

		if re.search('/s/summarizer', self.path):
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()
			content_len = int(self.headers.get('Content-Length',0))
			request_body = self.rfile.read(content_len)
			message = handle_url(request_body)
			text = json.loads(message)["choices"]["text"]
			print(text)
			# saveCommand = 'INSERT INTO summaries(Url,Summary) VALUES (%s, %s)'
			# dbCursor.execute( saveCommand, (str(request_body),str(message)) )
			# sumDB.commit()
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
		polled_id = self.path
		self.wfile.write(bytes(str(polled_id),"utf8"))

with HTTPServer(('', 42069), app) as server:
	server.serve_forever()
