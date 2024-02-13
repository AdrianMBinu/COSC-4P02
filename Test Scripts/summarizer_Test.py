import requests

llm_url = 'http://192.168.69.3:6980/v1/completions'
data = '{"model" : "llama-2-7b-chat/ggml-model-q4_0.gguf", "prompt": "The modern bourgeois society that has sprouted from the ruins of feudal society has not done away with class antagonisms. It has but established new classes, new conditions of oppression, new forms of struggle in place of the old ones. A summary of this sentence in 7 words is", "temperature": 0.7}'

x = requests.post(llm_url,data, headers = {"Content-Type": "application/json"})

print(x.text)
