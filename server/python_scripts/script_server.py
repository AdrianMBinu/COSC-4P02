import json #import json utilities
import re #imports regExp
import mysql.connector #for mySQL functionality
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
import summarizer
import threading
import time #for sleep and time-based dev functions

# evil :3
lock = threading.Lock()

def connect():
	sumDB = mysql.connector.connect(
		host="localhost",
		user="cosc4p02",
		password="summarizeme",
		database="4p02"
	)
	return (sumDB, sumDB.cursor())

sumDB, dbCursor = connect()

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
		"has_text": status,
		"text": summary.strip()
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
		"has_text": status,
		"text": sentiment.strip()
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
		except Exception as e:
			print(f"Exception on line 89: {e}")
			print("json error")
			print(f"request url in question: {url}")
	print(url)
	return get_url_summary(url)

def get_all_user_urls(type, userid):
    # result of poor design dummy
	column = "sentiment"
	table = "sentiments"
	wordcount = "sentiment_word_count"
	if type == "summary":
		column = "summary"
		table = "summaries"
		wordcount = "summary_word_count"
	fetchCommand = "SELECT url,url_word_count," + wordcount + "," + column + " FROM " + table + " WHERE userid=%s"
	dbCursor.execute( fetchCommand, (userid, ))
	results = dbCursor.fetchall()
	results_struct = []
	for result in results:
		results_struct.append({
			"url": result[0],
			"url_word_count": result[1],
			"result_word_count": result[2],
			"result_text": result[3]
		})
		print(result)
	data = {
		"results": results_struct
	}
 
	return json.dumps(data);

def run_summarizer(url, userid, word_count = 300):
    # We need the lock to make sure that there is no double requests of urls. The LLM will struggle if we run more than one query at once.
	print(f"Trying to lock for url (summary) '{url}'!")
	lock.acquire()
	print(f"Lock aquired for url (summary) '{url}'!")
	try:
		# we do not want to be able to queue the same url more than once (to save resources).
		if (has_url_summary(url)):
			print("I already have this url SILLY")
			return
	
		begin_command = 'INSERT INTO summaries(url, url_word_count, userid) VALUES (%s, 0, %s)'
		dbCursor.execute( begin_command, (str(url), userid) )
		sumDB.commit()
	
		# Handle either video or text site, return text or audio -> text content
		text = summarizer.handle_url(url)
		if len(text) == 0:
			print("Failed to fetch website")
			return
  
		word_count_command = 'UPDATE summaries SET url_word_count=%s WHERE url=%s'
		dbCursor.execute( word_count_command, (len(text), str(url)) )
		sumDB.commit()
  
		summary = summarizer.summarize(text, word_count)
	
		sum_text = json.loads(summary)["choices"][0]["text"].strip()
		
		end_command = 'UPDATE summaries SET summary=%s, summary_word_count=%s, end=CURRENT_TIMESTAMP() WHERE url=%s'
		dbCursor.execute( end_command, (str(sum_text), len(sum_text), str(url)) )
		sumDB.commit()
	finally:
		print("Unlocking")
		lock.release()
	print("wrote summary of "+str(url)+" to database ["+str(time.ctime())+"]")
 
def run_sentiment(url, userid, word_count = 300):
     # We need the lock to make sure that there is no double requests of urls. The LLM will struggle if we run more than one query at once.
	print(f"Trying to lock for url (sentiment) '{url}'!")
	lock.acquire()
	print(f"Lock aquired for url (sentiment) '{url}'!")
	try:
		# we do not want to be able to queue the same url more than once (to save resources).
		if (has_url_sentiment(url)):
			print("I already have this url SILLY")
			return
	
		begin_command = 'INSERT INTO sentiments(url, url_word_count, userid) VALUES (%s, 0, %s)'
		dbCursor.execute( begin_command, (str(url), userid) )
		sumDB.commit()
	
		# Handle either video or text site, return text or audio -> text content
		text = summarizer.handle_url(url)
  
		if len(text) == 0:
			print("Failed to fetch website")
			return
  
		word_count_command = 'UPDATE sentiments SET url_word_count=%s WHERE url=%s'
		dbCursor.execute( word_count_command, (len(text), str(url)) )
		sumDB.commit()
  
		sentiment = summarizer.sentiment(text, word_count)
	
		sent_text = json.loads(sentiment)["choices"][0]["text"].strip()
		
		end_command = 'UPDATE sentiments SET sentiment=%s, sentiment_word_count=%s, end=CURRENT_TIMESTAMP() WHERE url=%s'
		dbCursor.execute( end_command, (str(sent_text), len(sent_text), str(url)) )
		sumDB.commit()
	finally:
		print("Unlocking")
		lock.release()
	print("wrote sentiment of "+str(url)+" to database ["+str(time.ctime())+"]")

def process_url(request_body):
	url = request_body
	if request_body.startswith("{"):
		try:
			json_data = json.loads(request_body)
			word_count = 300
			try:
				word_count = int(json_data["word_count"])
			except:
				word_count = 300
			print(f"Running with word count {word_count}")
			url = json_data["url"]
			userid = 0
			try:
				userid = json_data["userid"]
			except:
				userid = 0
			if json_data["type"] == "summary":
				run_summarizer(url, userid, word_count)
			elif json_data["type"] == "sentiment":
				run_sentiment(url, userid, word_count)
			else:
				print("unsupported type!")
		except Exception as e:
			print(f"Silly Exception: {e}")
			print('json error 2')
			print(f"request body in question {request_body}")
	else:
		run_summarizer(url, 0)
	
 
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
		global sumDB, dbCursor
		sumDB, dbCursor = connect()
		# vv None of this is optimal or readable code, too bad vv
		if re.search('/s/fetch', self.path):
			request_body = self.get_content()
			status, json_response = get_url(request_body)
			self.set_headers(200 if status else 206)
			self.wfile.write(bytes(json_response, "utf8"))
		elif re.search('/s/user_requests_fetch', self.path):
			request_body = self.get_content()
			json_data = json.loads(request_body)
			userid = 0
			type = "summary"
			try:
				type = json_data['type']
				userid = json_data['userid']
				self.set_headers(200)
				json_response = get_all_user_urls(type, userid)
				self.wfile.write(bytes(json_response, "utf8"))
			except Exception as e:
				self.set_headers(206)
				self.wfile.write(bytes(str(e), "utf8"))
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
