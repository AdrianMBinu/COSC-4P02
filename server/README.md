# Server Side 
## Information
The server side local AI instance needs to be switched to the FFMPEG version in order to use whisper. Figuring out the docker commands (for the second time) is annoying, so if I have to do this again the commands are provided here.
This also serves as proof of LLM team work as some aspects such as LLM itself will not be directly exposed to the public VM rather it is proivded via an API. This done due to the high performance requirements of LLMs and general
security concerns. The rest of this file contains important information regarding any server side aspects of this project.
## Endpoints
LocalAI: `192.168.69.3:6980` <br>
LocalAI LLaMA LLM: `http://192.168.69.3:6980/v1/completions` <br>
LLaMA model (Only one available, all others have not been quantized!): `llama-2-7b-chat/ggml-model-q4_0.gguf`<br>
Example prompt to the LLM: <br>
```shell
curl http://192.168.69.3:6980/v1/completions -H "Content-Type: application/json" -d '{
     "model": "llama-2-7b-chat/ggml-model-q4_0.gguf",
     "prompt": "im a little tea pot ",
     "temperature": 0.7
   }'
```
How to login to the server 101:<br>
See the pinned message on the discord server. Any SSH/SFTP client will work.<br>
### *Please do not modify any of the shell files*
