import json #import json utilities
import re #imports regExp
import mysql.connector #for mySQL functionality
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
from summarizer import handle_url, summarize, sentiment
import threading
import time #for sleep and time-based dev functions

sumDB = mysql.connector.connect(
	host="localhost",
	user="cosc4p02",
	password="summarizeme",
	database="4p02"
)

dbCursor = sumDB.cursor()
# evil :3
lock = threading.Lock()

def has_url_summary(url):
	look_command = "SELECT url FROM summaries WHERE url=%s"
	dbCursor.execute(look_command, (str(url),))
	dbCursor.fetchall()
	if (dbCursor.rowcount > 0):
		return True
	return False

def has_url_sentiment(url):
	look_command = "SELECT url FROM sentiments WHERE url=%s"
	dbCursor.execute(look_command, (str(url),))
	dbCursor.fetchall()
	if (dbCursor.rowcount > 0):
		return True
	return False

def get_url_summary(url):
	print(url)
	fetchCommand = "SELECT summary FROM summaries WHERE url=%s"
	dbCursor.execute( fetchCommand, (str(url),) )
	result = dbCursor.fetchone()
	dbCursor.fetchall()
 
	hasUrl = has_url_summary(url)
	status = False
	summary = ""
	if hasUrl and (result[0] is not None):
		summary = str(result[0])
		status = True
	data = {
		"has_url": hasUrl,
		"has_summary": status,
		"summary": summary.strip()
	}
 
	return (status, json.dumps(data));

def get_url_sentiment(url):
	print(url)
	fetchCommand = "SELECT sentiment FROM sentiments WHERE url=%s"
	dbCursor.execute( fetchCommand, (str(url),) )
	result = dbCursor.fetchone()
	dbCursor.fetchall()
 
	hasUrl = has_url_sentiment(url)
	status = False
	sentiment = ""
	if hasUrl and (result[0] is not None):
		sentiment = str(result[0])
		status = True
	data = {
		"has_url": hasUrl,
		"has_sentiment": status,
		"sentiment": sentiment.strip()
	}
 
	return (status, json.dumps(data));

def get_url(url):
	if url.startswith('{'):
		try:
			json_data = json.loads(url)
			if json_data["type"] == "summary":
				return get_url_summary(json_data["url"])
			elif json_data["type"] == "sentiment":
				return get_url_sentiment(json_data["url"])
			else:
				print("Unsupported type!")
		except:
			print("json error")
	return get_url_summary(url)

def run_summarizer(url, word_count = 300):
    # We need the lock to make sure that there is no double requests of urls. The LLM will struggle if we run more than one query at once.
	print(f"Trying to lock for url (summary) '{url}'!")
	lock.acquire()
	print(f"Lock aquired for url (summary) '{url}'!")
	try:
		# we do not want to be able to queue the same url more than once (to save resources).
		if (has_url_summary(url)):
			print("I already have this url SILLY")
			return
	
		begin_command = 'INSERT INTO summaries(url, url_word_count) VALUES (%s, 0)'
		dbCursor.execute( begin_command, (str(url),) )
		sumDB.commit()
	
		# Handle either video or text site, return text or audio -> text content
		text = handle_url(url)
  
		word_count_command = 'UPDATE summaries SET url_word_count=%s WHERE url=%s'
		dbCursor.execute( word_count_command, (len(text), str(url)) )
		sumDB.commit()
  
		summary = summarize(text, word_count)
	
		sum_text = json.loads(summary)["choices"][0]["text"].strip()
		
		end_command = 'UPDATE summaries SET summary=%s, summary_word_count=%s, end=CURRENT_TIMESTAMP() WHERE url=%s'
		dbCursor.execute( end_command, (str(sum_text), len(sum_text), str(url)) )
		sumDB.commit()
	finally:
		print("Unlocking")
		lock.release()
	print("wrote summary of "+str(url)+" to database ["+str(time.ctime())+"]")
 
def run_sentiment(url, word_count = 300):
     # We need the lock to make sure that there is no double requests of urls. The LLM will struggle if we run more than one query at once.
	print(f"Trying to lock for url (sentiment) '{url}'!")
	lock.acquire()
	print(f"Lock aquired for url (sentiment) '{url}'!")
	try:
		# we do not want to be able to queue the same url more than once (to save resources).
		if (has_url_sentiment(url)):
			print("I already have this url SILLY")
			return
	
		begin_command = 'INSERT INTO sentiments(url, url_word_count) VALUES (%s, 0)'
		dbCursor.execute( begin_command, (str(url),) )
		sumDB.commit()
	
		# Handle either video or text site, return text or audio -> text content
		text = handle_url(url)
  
		word_count_command = 'UPDATE sentiments SET url_word_count=%s WHERE url=%s'
		dbCursor.execute( word_count_command, (len(text), str(url)) )
		sumDB.commit()
  
		sentiment = sentiment(text, word_count)
	
		sent_text = json.loads(sentiment)["choices"][0]["text"].strip()
		
		end_command = 'UPDATE sentiments SET sentiment=%s, sentiment_word_count=%s, end=CURRENT_TIMESTAMP() WHERE url=%s'
		dbCursor.execute( end_command, (str(sent_text), len(sent_text), str(url)) )
		sumDB.commit()
	finally:
		print("Unlocking")
		lock.release()
	print("wrote summary of "+str(url)+" to database ["+str(time.ctime())+"]")

def process_url(request_body):
	url = request_body
	if request_body.startswith("{"):
		try:
			json_data = json.loads(request_body)
			word_count
			try:
				word_count = int(json_data["word_count"])
			except:
				word_count = 300
			url = json_data["url"]
			if json_data["type"] == "summary":
				run_summarizer(url, word_count)
			elif json_data["type"] == "sentiment":
				run_sentiment(url, word_count)
			else:
				print("unsupported type!")
		except:
			print('json error')
	else:
		run_summarizer(url)
	
 
def get_time_estimate():
	command = '''WITH total_time_sec AS (
					SELECT 
						AVG(TIMESTAMPDIFF(SECOND, start, end)) AS seconds 
					FROM summaries 
					ORDER BY start DESC
					LIMIT 10
				), 
				differences AS (
					SELECT 
						seconds,
						MOD(seconds, 60) AS seconds_part, 
						MOD(seconds, 3600) AS minutes_part, 
						MOD(seconds, 3600 * 24) AS hours_part 
					FROM total_time_sec
				)

				SELECT 
					FLOOR(seconds / 3600 / 24) as days,
					FLOOR(hours_part / 3600) as hours,
					FLOOR(minutes_part / 60) as minutes,
					seconds_part as seconds
				FROM differences;'''
	dbCursor.execute( command )
	if (dbCursor.rowcount > 1):
		print("We have a bit of an error in the SQL statement!")
	row_data = dbCursor.fetchone()
	# make sure the cursor is clear of any extra data. should not do anything
	dbCursor.fetchall()
	try:
		data = {
			"days": int(row_data[0]),
			"hours": int(row_data[1]),
			"minutes": int(row_data[2]),
			"seconds": int(row_data[3])
		}
		return json.dumps(data)
	except Exception:
		return "{'days': 0, 'hours': 0, 'minutes': 0, 'seconds': 0}";
    

class app(BaseHTTPRequestHandler):
	def set_headers(self, code = 200, type = 'application/json'):
		self.send_response(code) 
		self.send_header('Content-type', type)
		self.end_headers()
    
	def get_content(self):
		content_len = int(self.headers.get('Content-Length',0)) 
		return self.rfile.read(content_len).decode('UTF-8')

	def do_POST(self):
		# vv None of this is optimal or readable code, too bad vv
		if re.search('/s/fetch', self.path):
			request_body = self.get_content()
			status, json_response = get_url(request_body)
   
			self.set_headers(200 if status else 206)
			self.wfile.write(bytes(json_response, "utf8"))
		elif re.search('/s/fetch_sentiment', self.path):
			request_body = self.get_content()
			status, json_response = get_url_sentiment(request_body)
			self.set_headers(200 if status else 206)
			self.wfile.write(bytes(json_response, "utf8"))
		elif re.search('/s/fetch_summary', self.path):
			request_body = self.get_content()
			status, json_response = get_url_summary(request_body)
			self.set_headers(200 if status else 206)
			self.wfile.write(bytes(json_response, "utf8"))
		elif re.search('/s/request', self.path):
			self.set_headers(200, "text/html")
			request_body = self.get_content()
			background_thread = threading.Thread(target=process_url, args=(request_body,))
			background_thread.daemon = True
			background_thread.start()
		elif re.search('/s/request_sentiment', self.path):
			self.set_headers(200, "text/html")
			request_body = self.get_content()
			background_thread = threading.Thread(target=run_sentiment, args=(request_body,))
			background_thread.daemon = True
			background_thread.start()
		elif re.search('/s/request_summary', self.path):
			self.set_headers(200, "text/html")
			request_body = self.get_content()
			background_thread = threading.Thread(target=run_summarizer, args=(request_body,))
			background_thread.daemon = True
			background_thread.start()
		elif re.search('/s/estimate', self.path):
			self.set_headers()
			request_body = self.get_content()
			self.wfile.write(bytes(get_time_estimate(), "utf8"))
		else:
			self.set_headers(404, 'text/html')
			self.wfile.write(bytes("Er 404: Invalid endpoint", "utf8"))
	def do_GET(self):
		self.set_headers(200, 'text/html')
		self.wfile.write(bytes(str(0),"utf8"))

with HTTPServer(('', 42069), app) as server:
	server.serve_forever()
