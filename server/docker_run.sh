#!/bin/bash
docker run -d --restart unless-stopped --name llms -p 6980:8080 -v /mnt/archive/public/llms/llama/llama/:/models quay.io/go-skynet/local-ai:v2.7.0-ffmpeg --models-path /models --context-size 700 --threads 16
