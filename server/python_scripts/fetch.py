import requests
import argparse
import functools 
import re
from bs4 import BeautifulSoup
import statistics

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
    
    recombined_lines = []
    charc_associations = []
    wordc_associations = []
    for l in lines:
        if (len(l) != 0):
            charc_associations.append(len(l))
            wc = len(re.split("\s", re.sub("[\"\']", "", l)))
            wordc_associations.append(wc)
            recombined_lines.append((l, wc))
            
    limit = 0
    try:
        wc_mean = statistics.mean(wordc_associations)
        wc_stdev = statistics.stdev(wordc_associations)
        wc_median = statistics.median(wordc_associations)
        wc_variance = statistics.variance(wordc_associations, wc_mean)
        wc_rv = wc_stdev / wc_mean
        
        cc_mean = statistics.mean(charc_associations)
        cc_stdev = statistics.stdev(charc_associations)
        cc_median = statistics.median(charc_associations)
        cc_variance = statistics.variance(charc_associations, cc_mean)
        cc_rv = cc_stdev / cc_mean
        
        # print(wc_mean)
        # print(wc_stdev)
        # print(wc_median)
        # print(wc_variance)
        # print(wc_rv)
        
        # print()

        # print(cc_mean)
        # print(cc_median)
        # print(cc_stdev)
        # print(cc_variance)
        # print(cc_rv)
        
        limit = wc_mean
        
        if (wc_rv > 1):
            limit += wc_stdev
        else:
            limit -= wc_stdev
    except Exception as e:
        print(e)
    
    if (limit < 10):
        limit = 10
        
    cleared_text = '\n'.join(line[0] for line in recombined_lines if (line[1] > limit))

    #print(cleared_text)
    #exit(0)
    
    words = re.split("\s", re.sub("[\"\']", "", cleared_text))
    cleared_words = (word.strip() for word in words if word.strip())
    back_to_text = ' '.join(cleared_words)
    return (back_to_text)

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