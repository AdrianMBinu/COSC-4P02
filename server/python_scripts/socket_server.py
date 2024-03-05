#!/usr/bin/env python

import asyncio
import websockets
from summarizer import fetch_and_summarize

async def handler(websocket, path):
	if path == "/s/summarizer":
		async for prompt_url in websocket:
			summary = fetch_and_summarize(prompt_url)
			if (summary != null):
				await websocket.send(summary)
			else:
				await websocket.send("error")
	else:
		await websocket.send("404: invalid endpoint")

async def main():
    async with websockets.serve(handler, "", 42069):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
