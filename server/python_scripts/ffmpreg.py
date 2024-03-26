import requests
import subprocess
import hashlib
import json 
import os


def fetch_video(url):
    hash = str(hashlib.sha256(url.encode('utf-8')).hexdigest())
    process = subprocess.Popen(['/home/cosc4p02/.local/bin/yt-dlp', '-o', hash, url], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = process.communicate()
    exit_code = process.wait()
    print(stdout, stderr, exit_code, hash)
    return (exit_code, hash)

def convert_video(hash):
    process = subprocess.Popen(['bash', '-c', "/usr/bin/ffmpeg -y -i " + hash + "*" + " -vn " + hash + ".ogg"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = process.communicate()
    exit_code = process.wait()
    print(stdout, stderr, exit_code)
    return exit_code

def get_video_text(hash):
    working_dir = os.getcwd()
    llm_url = 'http://192.168.69.3:6980/v1/audio/transcriptions'
    name = hash + ".ogg"
    path = working_dir + "/" + name
    print(path)
    with open(path, 'rb') as file:
        data = {
            "model": "whisper-1"
        }
        files = {'file': (path, file)}
        x = requests.post(llm_url, files=files, data=data)
    
        print(x.text)
        
        j = json.loads(x.text)
        
        text = ""
        
        try:
            text = j["text"]
        except:
            try:
                text = j["segments"]["text"]
            except:
                print("failed to load json")
                text = "SYSTEM FAILURE"
            
        print(text)
        
        subprocess.run(["bash", "-c", "rm " + hash + "*"])
        #subprocess.run(["bash", "-c", "rm " + name + "*"])
        
        return text