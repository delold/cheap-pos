from ws4py.client import WebSocketBaseClient
from ws4py.websocket import Heartbeat

import threading, json, time
from queue import Queue

import traceback
import logging

class AutoWSClient():
	def __init__(self, url):
		self._url = url
		self._storage = []
		self._th = threading.Thread(target=self.autoconnect, name="WebsocketClient")
		self._th.daemon = True


		self.inputQueue = Queue()
		self.outputQueue = Queue()

		self._client = None
		
		# self.autoconnect()


	def autoconnect(self):
		while True:
			if self._client == None or self._client.checkClosed() == True:
				print("Trying to connect")
				try:
					self._client = WSClient(url=self._url, inputQueue = self.inputQueue, outputQueue = self.outputQueue)
					self._client.connect()
				except Exception as e:
					self._client = None
					logging.error(traceback.format_exc())
			time.sleep(3)

	def startThread(self):
		self._th.start()
		pass

	def send(self, type, data = None):
		print("Sending", type)
		payload = json.dumps({"type": type, "data": data})
		self.inputQueue.put(payload)

	def close(self):
		if self._client != None:
			self._client.close()

class WSClient(WebSocketBaseClient):
	def __init__(self, url, protocols=[], extensions=None, heartbeat_freq=None, ssl_options=None, headers=None, inputQueue=None, outputQueue=None):
		WebSocketBaseClient.__init__(self, url, protocols, extensions, heartbeat_freq, ssl_options, headers=headers)
		self.isClosed = False
		self._input = inputQueue
		self._output = outputQueue

	def handshake_ok(self):
		self.run()

	def run(self):
		self.sock.setblocking(True)
		with Heartbeat(self, frequency=self.heartbeat_freq):
			s = self.stream
			try:
				self.opened()
				while not self.terminated:
					if not self._input.empty():
						item = self._input.get()
						self.send(item)
					if not self.once():
						print("Breaking")
						break
			finally:
				print("terminating")
				self.terminate()

	def opened(self):
		self.isClosed = False

	def closed(self, code, reason=None):
		self.isClosed = True
		print("Closed down", code, reason)

	def received_message(self, m):
		self._output.put(json.loads(str(m)))

	def checkClosed(self):
		return self.isClosed