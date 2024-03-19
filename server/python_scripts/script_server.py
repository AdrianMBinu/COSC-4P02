import json #import json utilities
import re #imports regExp
import mysql.connector #for mySQL functionality
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
from summarizer import handle_url
import threading
import time #for sleep and time-based dev functions

sumDB = mysql.connector.connect(
	host="localhost",
	user="cosc4p02",
	password="summarizeme",
	database="4p02"
)

dbCursor = sumDB.cursor()

def process_data(request_body):
	summary = handle_url(request_body) # <summary> is the llm response
	print("wrote summary of "+str(request_body)+" to database ["+str(time.ctime())+"]")
	sum_text = json.loads(summary)["choices"][0]["text"] # <sum_text> is the text extracted from the LLM json response
	saveCommand = 'INSERT INTO summaries(Url,Summary,Id) VALUES (%s, %s)'
	dbCursor.execute( saveCommand, (str(request_body),str(sum_text)) )
	sumDB.commit()

def get_data(request_body):
	fetchCommand = 'SELECT Summary FROM summaries WHERE Url="%s"'
	dbCursor.execute( fetchCommand % str(request_body) )
	result = dbCursor.fetchone()
	return "Invalid query" if (result is None) else result[0]

class app(BaseHTTPRequestHandler):
	def do_POST(self):
		# vv None of this is optimal or readable code, too bad vv
		if re.search('/s/summarizer/summaryfetch', self.path):
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()
			content_len = int(self.headers.get('Content-Length',0))
			request_body = self.rfile.read(content_len).decode('UTF-8')
			response = get_data(request_body)
			self.wfile.write(bytes(response,"utf8"))
		elif re.search('/s/summarizer', self.path):
			self.send_response(200) # set response code (200)
			self.send_header('Content-type','text/html') # add header info 'Content-type'
			self.end_headers() # end of header info
			content_len = int(self.headers.get('Content-Length',0)) # <content_len> is the request-data length
			request_body = self.rfile.read(content_len).decode('UTF-8') # read request body
			background_thread = threading.Thread(target=process_data, args=(request_body,))
			background_thread.daemon = True
			background_thread.start()
		else:
			self.send_response(404)
			self.send_header('Content-type','text/html')
			self.end_headers()
			erMsg = "Er 404: Invalid endpoint"
			self.wfile.write(bytes(erMsg, "utf8"))
	def do_GET(self): # test GET, for testing fetching an summary -- using id -- from the db
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()
		polled_id = 0
		self.wfile.write(bytes(str(polled_id),"utf8"))

with HTTPServer(('', 42069), app) as server:
	server.serve_forever()
