import requests
import re
import argparse
import ffmpreg
from fetch import fetch_and_split

def run_llm(prompt):
	llm_url = 'http://192.168.69.3:6980/v1/completions'
	data = '{"model" : "llama-2-7b-chat/ggml-model-q4_0.gguf", "prompt": "'+prompt+'", "temperature": 0.7}'

	x = requests.post(llm_url,data, headers = {"Content-Type": "application/json"})

	return x.text

def sentiment(text, word_count = 300):
	prompt = re.sub(r'[^\x00-\x7F]+|\\','',text) + ". A sentiment analysis of all the previous text in " + str(word_count) + " words is"
	return run_llm(prompt)

def summarize(text, word_count = 300):
	prompt = re.sub(r'[^\x00-\x7F]+|\\','',text) + ". A summary of all the previous text in " + str(word_count) + " words is"
	return run_llm(prompt)


def handle_url(url):
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url
    
    exit_code, hash = ffmpreg.fetch_video(url)
    if exit_code == 0:
        ffmpreg.convert_video(hash)
        return ffmpreg.get_video_text(hash)
    else:
        return fetch_and_split(url)

if __name__ == "__main__":
	parser = argparse.ArgumentParser(prog="URL Summarizer", description="Download and summerize a url with requests / GET")
	parser.add_argument("url")
	args = parser.parse_args()
	#print(fetch_and_summarize("https://stackoverflow.com/questions/328356/extracting-text-from-html-file-using-python"))
	print(handle_url(args.url))
