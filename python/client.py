# -*- coding: utf-8 -*-
from tkinter import *
from tkinter.ttk import *

import json
import time
import urllib.request
import concurrent.futures

class FakeKey(object):
	def __init__(self, name="", keycode=0):
		self.__dict__.update(char=name, keycode=keycode)

	def __eq__(self, other):
		return self.__dict__ == other.__dict__

class HttpClient():
	def __init__(self, url, callback):
		self._executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
		self._callback = callback
		self.url = url

		self.terminate = False

	def send(self, type, data = None):
		future = self._executor.submit(self._download, self.url, json.dumps({"type": type, "data": data}))
		future.add_done_callback(self._callback)

	def _download(self, url, payload):
		fulfilled = False
		data = None
		while fulfilled == False and self.terminate == False:
			try:
				req = urllib.request.Request(url, data=payload.encode("utf-8"), headers={"Content-type": "application/json"})
				res = urllib.request.build_opener().open(req)
				data = json.loads(res.read().decode("utf-8"))
				fulfilled = True
			except:
				print("Failed to connect")
				fulfilled = False
		return data

	def exit(self, wait = True):
		self.terminate = True
		self._executor.shutdown(wait)

class Cashier:
	def __init__(self):
		# rest server
		self.httpClient = HttpClient("http://127.0.0.1:5116/api/", self.onDataReceived)
		self.httpClient.send("ping")

		# data related stuff
		self.buffer = ""
		self.cart = []

		# ui variables
		self.mode = "input"
		self.reverseMode = False
		self.clearMode = 0

	def start(self):
		self._master = Tk()
		self._master.minsize(width=500, height=500)
		self._master.wm_title("Cashier")
		self._master.protocol("WM_DELETE_WINDOW", self.onExit)

		frame = Frame(self._master)
		frame.focus_set()
		self.bindEvents(frame)
		frame.pack(expand=True, fill=BOTH)

		workplace = Frame(frame, width=500)
		workplace.pack_propagate(0)
		workplace.pack(anchor=NW, fill=Y, expand=False, side=LEFT)
		self.bindEvents(workplace)

		inputwrapper = Frame(workplace, width=500, height=150)
		inputwrapper.pack_propagate(0)
		inputwrapper.pack(anchor=NW, fill=None, expand=False, side=TOP)
		self.bindEvents(inputwrapper)

		self.input = Label(inputwrapper, text="0,00", font=("Arial", 52))
		self.input.pack(fill=Y, expand=True, anchor=NE, padx=20)
		self.bindEvents(self.input)

		info = Frame(workplace)
		info.pack_propagate(0)
		info.pack(expand=True, fill=BOTH, side=TOP)
		self.bindEvents(info)

		table = Frame(frame)
		table.pack(anchor=N, fill=BOTH, expand=True, side=LEFT)
		self.bindEvents(table)

		listview = Frame(table)
		listview.pack(expand=True, fill=BOTH, anchor=N)

		scrollbar = Scrollbar(listview, orient=VERTICAL)
		scrollbar.pack(expand=False, fill=Y, anchor=E, side=RIGHT)

		self.tree = Treeview(listview, yscrollcommand=scrollbar.set)
		self.tree["columns"]=("#", "pocet", "cena", "celkem")
		self.tree.column("#", width=25, anchor=CENTER)
		self.tree.column("pocet", width=100, anchor=E)
		self.tree.column("cena", width=100,anchor=E)
		self.tree.column("celkem", width=100, anchor=E)
		self.bindEvents(self.tree)

		self.tree.heading("#", text="#")
		self.tree.heading("pocet", text="Počet ks")
		self.tree.heading("cena", text="Cena za ks")
		self.tree.heading("celkem", text="Celkem")
		self.tree.pack(expand=True, fill=BOTH, anchor=N, side=RIGHT)
		scrollbar.config(command = self.tree.yview)

		buttonwrap = Frame(table, height=50)
		buttonwrap.pack_propagate(0)
		buttonwrap.pack(expand=False, fill=X, anchor=S)

		self.confirm = Button(buttonwrap, text="Účtovat", command=lambda: self.onKey(FakeKey(keycode=33) if self.mode == "input" else FakeKey("\r")))
		self.confirm.state(["disabled"])
		self.confirm.pack(expand=True, fill=BOTH)
		self.bindEvents(self.confirm)

		self._master.mainloop()

	def stop(self):
		if self._master is not None:
			self.onExit()

	def bindEvents(self, widget):
		widget.bind("<Key>", self.onKey)
		widget.bind("<Up>", lambda event: self.onKey(FakeKey("up")))
		widget.bind("<Down>", lambda event: self.onKey(FakeKey("down")))
		widget.bind("<Left>", lambda event: self.onKey(FakeKey("left")))
		widget.bind("<Right>", lambda event: self.onKey(FakeKey("right")))
		widget.bind("<Delete>", lambda event: self.onKey(FakeKey("delete")))
		widget.bind("<Home>", lambda event: self.onKey(FakeKey("home")))

	def checkout(self, paid):
		total = self.getCartSum()
		self.httpClient.send("checkout", {"total": total, "date": int(round(time.time() * 1000)), "items": self.cart, "paid": paid, "returned": paid - total})

	def addItem(self, price, amount = 1, discount = False):
		display = ""
		if isinstance(price, str):
			display = self.getDisplayValue(str(price), divider=" ", dash=".", suffix=",-")
			price = self.getValue()
		else:
			display = str(price)
			price = price

		discounts = len([item for item in self.cart if item["discount"] == True])
		targetpos = len(self.cart) - discounts if discount == False else len(self.cart)

		itempos = str(targetpos+1)
		itemname = display
		itemamount = str(amount)+" ks"
		itemper = display

		if discount == True:
			display = "-" + display
			price = price * -1

			itemname = "Sleva"
			itempos = ""
			itemamount = ""
			itemper = ""

		self.cart.insert(targetpos, {"iid":0,"name":itemname,"barcode":0,"amount":amount,"price":price,"total":price*amount, "discount": discount})
		iid = self.tree.insert("", targetpos, text=itemname, values=(itempos, itemamount, itemper, display))
		self.setSelection(iid)

	def setSelection(self, iid):
		self.tree.selection_set(iid)
		self.tree.yview(self.tree.index(iid))

	def appendKey(self, key):
		if key not in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ","]:
			return False

		if key == ",":
			return "," not in self.buffer

		if "," in self.buffer:
			return len(self.buffer.split(",")[1]) < 2
		else:
			if len(self.buffer) <= 0:
				return key != "0"
			else:
				return len(self.buffer.split(",")[0]) < 7
		return False

	def onExit(self):
		print("Goodbye")
		self._master.destroy()
		self.httpClient.exit(False)

	def onDataReceived(self, future):
		if future is not None:
			result = future.result()
			type = result["type"] if result is not None and "type" in result else None	
			data = result["data"] if result is not None and "data" in result else None	
			if type is not None:
				print(type, data)

	def onKey(self, event):
		if self.clearMode > 0:
			if self.clearMode == 2:
				self.tree.delete(*self.tree.get_children())
				self.cart = []
			self.buffer = ""
			self.clearMode = 0

		if self.appendKey(event.char):
			self.buffer = self.buffer + event.char
		elif event.char == "\x08" and len(self.buffer) > 0:
			self.buffer = self.buffer[:(-2 if self.buffer[-1] == "," else -1)]
		elif event.char in ["up", "down"]:
			selection = self.tree.selection()
			item = self.tree.prev(selection) if event.char == "up" else self.tree.next(selection)
			if len(item) > 0:
				self.setSelection(item)
		elif event.char in ["+", "-"]:
			selection = self.tree.selection()
			if len(selection) > 0:
				index = self.tree.index(selection)
				if self.cart[index]["discount"] == False:
					self.cart[index]["amount"] = max(1, self.cart[index]["amount"] + (1 if event.char == "+" else -1))
					self.cart[index]["total"] = self.cart[index]["amount"]  * self.cart[index]["price"]
					self.tree.set(selection, "pocet", str(self.cart[index]["amount"]) + " ks")
					self.tree.set(selection, "celkem", self.getDisplayValue(self.cart[index]["total"], divider=" ", dash=".", suffix=",-"))
		elif event.char == "delete":
			selection = self.tree.selection()
			if len(selection) > 0:
				index = self.tree.index(selection)
				self.cart.pop(index)

				nextselect = self.tree.next(selection) if len(self.tree.next(selection)) > 0 else self.tree.prev(selection)
				self.setSelection(nextselect)

				self.tree.delete(selection)

				children = self.tree.get_children("") if len(self.cart) > 0 else []
				nextindex = children.index(nextselect) if nextselect != "" else -1

				if nextindex >= 0:
					for child in children[nextindex:]:
						nextindex = nextindex + 1
						if self.cart[nextindex-1]["discount"] == False:
							self.tree.set(child, "#", str(nextindex))
						else:
							self.tree.set(child, "#", "")

				if len(children) <= 0 and self.mode == "return":
					self.mode = "input"
					self.confirm.state(["!disabled"])
		elif event.keycode == 33:
			#TODO: maybe add the item if text != null and cart is empty, then checkout
			if self.mode != "return" and len(self.cart) > 0:
				self.mode = "return"
				self.buffer = self.getCartSum()
				self.confirm.state(["disabled"])
			else:
				self.mode = "input"
				self.buffer = 0
				self.confirm.state(["!disabled"])

			self.reverseMode = False
			self.clearMode = 1
			self.buffer = self.getDisplayValue(self.buffer, divider="", dash=",")
		elif event.char == "home":
			#TODO: discount madafaka
			if self.mode != "return":
				self.reverseMode = self.reverseMode != True

		elif event.char == "\r" and len(self.buffer) > 0:
			if self.mode == "return":
				self.mode = "input"
				self.checkout(self.getValue())

				self.buffer = self.getValue() - self.getCartSum()
				self.clearMode = 2
				self.setSelection("")
			else:
				self.addItem(self.buffer, discount=self.reverseMode)
				self.reverseMode = False
				self.buffer = ""

		if len(self.cart) == 0:
			self.confirm.config(text="Checkout")
			self.confirm.state(["disabled"]) 
		else:
			label = ""
			sumview = self.getCartSum()
			addNumber = True

			if self.mode == "return":
				label = "Vrátit"
				if self.clearMode == 1:
					sumview = -sumview
				else:
					sumview = self.getValue() - sumview
			elif self.clearMode == 2:
				label = "Smazat"
				addNumber = False
			else:
				label = "Účtovat"

			if addNumber == True:
				label = label + " " + self.getDisplayValue(sumview, divider=" ", dash=".", suffix=",- Kč")

			self.confirm.config(text=label)
			self.confirm.state(["!disabled"]) 

		if self.reverseMode:
			self.input.config(text="-"+self.getDisplayValue(self.buffer))
		else:
			self.input.config(text=self.getDisplayValue(self.buffer))

	def getCartSum(self):
		return sum(item["total"] for item in self.cart)
	
	def getValue(self):
		if len(self.buffer) <= 0 or self.buffer == ",":
			return 0
		return float(self.buffer.replace(",", "."))

	def getDisplayValue(self, ref, divider = ".", dash = ",", suffix = ""):
		if not isinstance(ref, str):
			ref = str(ref).replace(".", ",")

		isNegative = "-" in ref
		temp = ref.replace("-", "").split(",")

		if len(temp) == 1:
			temp.append("")

		if len(temp[0]) == 0:
			temp[0] = "0"

		temp[1] = temp[1] + "0" * (2 - len(temp[1]))
		size = len(temp[0])

		for i in range(0, size):
			pos = size - 1 - i
			if (i+1) % 3 == 0 and pos > 0:
				temp[0] = temp[0][:pos] + divider + temp[0][pos:]

		if isNegative == True:
			temp[0] = "-" + temp[0]

		return ",".join(temp).replace(",", dash) + suffix

if __name__ == "__main__":
	try:
		app = Cashier()
		app.start()
	except KeyboardInterrupt:
		app.stop()