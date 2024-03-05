import requests
import re
import argparse
from fetch import fetch_and_split

def fetch_and_summarize(url):
	llm_url = 'http://192.168.69.3:6980/v1/completions'
	# url = 'https://stackoverflow.com/questions/328356/extracting-text-from-html-file-using-python'
	prompt = fetch_and_split(url)
	prompt = re.sub(r'[^\x00-\x7F]+|\\','',prompt)

	data = '{"model" : "llama-2-7b-chat/ggml-model-q4_0.gguf", "prompt": "'+prompt+'. A summary of all the previous text in 300 words is", "temperature": 0.7}'

	x = requests.post(llm_url,data, headers = {"Content-Type": "application/json"})

	return x.text

if __name__ == "__main__":
	parser = argparse.ArgumentParser(prog="URL Summarizer", description="Download and summerize a url with requests / GET")
	parser.add_argument("url")
	args = parser.parse_args()
	#print(fetch_and_summarize("https://stackoverflow.com/questions/328356/extracting-text-from-html-file-using-python"))
	print(fetch_and_summarize(args.url))
