import requests
import argparse
import functools 
import re
from bs4 import BeautifulSoup

def fetch_url(url):
    request = requests.get(url)
    
    if (request.status_code != 200):
        print(f"Error reading site status code {request.status_code}")
        return ""
    
    # We are using BeautifulSoup to parse the HTML
    parser = BeautifulSoup(request.text, features="html.parser")
    
    # remove unwanted elements
    for script in parser(["script", "style", "header", "footer"]):
        script.extract()
    
    return parser.get_text() 

def split_words(text):
    lines = (line.strip() for line in text.splitlines())
    
    for l in lines:
        if (len(l) != 0):
            print(len(l))
    
    cleared_text = '\n'.join(line for line in lines if len(line) != 0)
    
    words = re.split("\s", re.sub("[\"\']", "", cleared_text))
    cleared_words = (word.strip() for word in words if word.strip())
    back_to_text = ' '.join(cleared_words)
    return (list(cleared_words), back_to_text)

def word_count(words):
    return len(words)

def fetch_and_split(url):
    return split_words(fetch_url(url))
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="URL Fetecher", description="Download a url with requests / GET")
    parser.add_argument("url")
    
    args = parser.parse_args()
    
    url_data = fetch_url(args.url)
    
    print(url_data)
    print(split_words(url_data))