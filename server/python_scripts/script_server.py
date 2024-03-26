import json #import json utilities
import re #imports regExp
import mysql.connector #for mySQL functionality
from http.server import BaseHTTPRequestHandler, HTTPServer #imports http & server functionality
from summarizer import handle_url, summarize
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

def has_url(url):
	look_command = "SELECT url FROM summaries WHERE url='%s'"
	dbCursor.execute(look_command % str(url))
	dbCursor.fetchall()
	if (dbCursor.rowcount > 0):
		return True
	return False

def get_url_summary(url):
	fetchCommand = 'SELECT summary FROM summaries WHERE url="%s"'
	dbCursor.execute( fetchCommand % str(url) )
	result = dbCursor.fetchone()
	dbCursor.fetchall()
	return "INCOMPLETE SUMMARY" if (result is None) else str(result[0]).strip()

def process_url(url):
	# We need the lock to make sure that there is no double requests of urls. The LLM will struggle if we run more than one query at once.
	print(f"Trying to lock for url '{url}'!")
	lock.acquire()
	print(f"Lock aquired for url '{url}'!")
	try:
		# we do not want to be able to queue the same url more than once (to save resources).
		if (has_url(url)):
			print("I already have this url SILLY")
			return
	
		begin_command = 'INSERT INTO summaries(url, url_word_count) VALUES ("%s", 0)'
		dbCursor.execute( begin_command, (str(url),) )
		sumDB.commit()
	
		# Handle either video or text site, return text or audio -> text content
		text = handle_url(url)
  
		word_count_command = 'UPDATE summaries SET url_word_count=%s WHERE url="%s"'
		dbCursor.execute( word_count_command, (len(text), str(url)) )
		sumDB.commit()
  
		summary = summarize(text)
	
		sum_text = json.loads(summary)["choices"][0]["text"] 
		
		end_command = 'UPDATE summaries SET summary="%s", summary_word_count=%s, end=CURRENT_TIMESTAMP() WHERE url="%s"'
		dbCursor.execute( end_command, (str(sum_text), len(sum_text), str(url)) )
		sumDB.commit()
	finally:
		print("Unlocking")
		lock.release()
	print("wrote summary of "+str(url)+" to database ["+str(time.ctime())+"]")
 
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
    return_string = ""
    
    # todo: better, string builder?
    if (row_data[0] != 0):
        return_string += str(row_data[0]) + " days, "
        return_string += str(row_data[1]) + " hours, "
        return_string += str(row_data[2]) + " minutes, "
        return_string += str(row_data[3]) + " seconds"
    elif (row_data[1] != 0):
        return_string += str(row_data[1]) + " hours, "
        return_string += str(row_data[2]) + " minutes, "
        return_string += str(row_data[3]) + " seconds"
    elif (row_data[2] != 0):
        return_string += str(row_data[2]) + " minutes, "
        return_string += str(row_data[3]) + " seconds"
    else:
        return_string += str(row_data[3]) + " seconds"
    
    return return_string
    

class app(BaseHTTPRequestHandler):
	def do_POST(self):
		# vv None of this is optimal or readable code, too bad vv
		if re.search('/s/fetch', self.path):
			self.send_response(200)
			self.send_header('Content-type','text/html')
			self.end_headers()
			content_len = int(self.headers.get('Content-Length',0))
			request_body = self.rfile.read(content_len).decode('UTF-8')
			response = get_url_summary(request_body)
			self.wfile.write(bytes(response, "utf8"))
		elif re.search('/s/request', self.path):
			self.send_response(200) # set response code (200)
			self.send_header('Content-type','text/html') # add header info 'Content-type'
			self.end_headers() # end of header info
			content_len = int(self.headers.get('Content-Length',0)) # <content_len> is the request-data length
			request_body = self.rfile.read(content_len).decode('UTF-8') # read request body
			background_thread = threading.Thread(target=process_url, args=(request_body,))
			background_thread.daemon = True
			background_thread.start()
		elif re.search('/s/estimate', self.path):
			self.send_response(200)
			self.send_header('content_type', 'text/html')
			self.end_headers()
			self.wfile.write(bytes(get_time_estimate(), "utf8"))
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
