"use strict";

const WSServer = require("ws").Server;
const Datastore = require("nedb");
const md5 = require("md5");

const http = require("http");
const path = require("path");

const express = require("express");
const cors = require("cors");

const fs = require("fs");
const when = require("when");

class Server {
	constructor(port) {
		this.db = [];
		this.itemdb = null;
		// this.wss = new WSServer({port: port});
		// this.wss.on("connection", this.onWSConnection.bind(this));
		// this.wss.on("error", function(err) {
		// 	console.log(err)
		// });
		this.wss = null;
		this.port = null;	

		if (port !== undefined) {
			this.port = port;
			this.http = http.createServer(this.onHttpMessage.bind(this));
		} 
	}

	middleware() {
		return this.onHttpMessage.bind(this);
	}

	start() {
		this.http.listen(this.port, () => {
			console.log("Starting on port: "+this.port);
		});
	}

	stop() {
		this.wss.clients.forEach((client) => {
			this.send(client, "stop");
		});
	}

	onHttpMessage(request, response, next) {
		var next = (next !== null && next !== undefined) ? next : function() {};

		if(request.method == "POST" && request.headers["content-type"] === "application/json") {
			let body = "";
			let self = this;

			request.on('data', (data) => {
				body += data;
				if (body.length > 1e6) {
					request.connection.destroy();
				}
			});

			request.on('end', () => {
				var data = JSON.parse(body);
					self.onMessage(response, data.type, data.data);	
				// try {
				// 	var data = JSON.parse(body);
				// 	self.onMessage(response, data.type, data.data);
				// } catch (err) {
				// 	response.end(JSON.stringify({"type": "error", "data": 500}));
				// 	console.log(err.message);
				// }
			});
		} else {
			response.end(JSON.stringify({"type": "error", "data": 404}));
		}
	}

	send(client, type, data) {
		var payload = JSON.stringify({"type": type, "data": data});

		if (client instanceof http.ServerResponse) {
			client.end(payload);
		} else {
			client.send(payload);
		}
	}

	onMessage(client, type, data) {
		let self = this;

		switch(type) {
			case "ping":
				self.send(client, "pong");
				break;
			case "open":
				break;
			case "total":
				var selected = self.retrieveLogDatabase(data);

				if(!self.isDatabase(selected)) {
					return self.send(client, "status", {"status": "fail", "hash": null, "error": "no db found"});
				}

				selected.datastore.find({}, (err, docs) => {
					if (err !== null) {
						self.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						var count = docs.length;
						var total = docs.reduce((sum, doc) => sum + doc.total, 0);

						self.send(client, "total", {"count": count, "total": total});
					}
				})

				break;
			case "checkout":
				var selected = self.retrieveLogDatabase(self.getTime(data.date), true);
				
				if(!self.isDatabase(selected)) {
					return self.send(client, "status", {"status": "fail", "hash": null, "error": "no db found"});
				}

				selected.datastore.insert(data, (err, newDoc) => {
					if (err !== null) {
						self.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						self.send(client, "status", {"status": "ok", "hash": self.getHash(newDoc)});
					}
				});

				break;
			case "additem":
				self.retrieveItemDatabase().insert(data, (err, newDoc) => {
					if (err !== null) {
						self.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						self.send(client, "status", {"status": "ok", "hash": self.getHash(newDoc)});
					}
				});
			case "getitem":
				let db = self.retrieveItemDatabase();

				if(data.type !== undefined && ["upc", "name", "id"].indexOf(data.type) >= 0) {
					if (data.query === undefined) {
						return self.send(client, "status", {"status": "fail", "hash": null, "error": "query not defined"});
					}

					let querytype = data.type === "id" ? "_id" : data.type;

					data.query = (data.type === "name") ? new RegExp(data.query, "gi") : data.query;
					db.find({[querytype]: data.query}, (err, docs) => {
						let result = docs === null || docs === undefined ? [] : docs;
						result.sort(function(a, b) {
							var x= a.name.toLowerCase();
							var y= b.name.toLowerCase();
							if (x < y) 
								return -1;
							if (x > y)
								return 1;
							return 0; 
						});

						self.send(client, "getitem", {"count": result.length, "result": result});
					});

				} else {
					self.send(client, "status", {"status": "fail", "hash": null, "error": "query type not defined or not supported"});
				}

				break;
			case "removeitem":
				if (data.id === undefined) {
					return self.send(client, "status", {"status": "fail", "hash": null, "error": "id not defined"});
				}

				self.retrieveItemDatabase().remove({"_id": data.id}, {}, (err, numRemoved) => {
					if (numRemoved <= 0) {
						self.send(client, "status", {"status": "fail", "hash": null, "err": "empty"});
					} else {
						self.send(client, "status", {"status": "ok", "hash": numRemoved});
					}
				});

				break;
			case "upcmap":
				let items = self.retrieveItemDatabase().find({}, (err, docs) => {
					let list = docs === null || docs === undefined ? [] : docs;
					let result = {};
					list.forEach((item) => {
						let upc = item.upc === null || item.upc === undefined ? -1 : item.upc;
						if(result[upc] === undefined) {
							result[upc] = [];
						}
						result[upc].push(item._id);
					});

					self.send(client, "upcmap", {"count": Object.keys(result).length, "result": result});
				});

				break;
			case "namemap":
				self.retrieveItemDatabase().find({}, (err, docs) => {
					let list = docs === null || docs === undefined ? [] : docs;
					let result = docs.map((item) => ({"name" : item.name, "id": item._id}));
					self.send(client, "namemap", {"count": result.length, "result": result});
				});

				break;
			case "getitems":
				self.retrieveItemDatabase().find({}, (err, docs) => {
					docs = docs === null || docs === undefined ? [] : docs;
					docs.sort(function(a, b) {
						var x= a.name.toLowerCase();
						var y= b.name.toLowerCase();
						if (x < y) 
							return -1;
						if (x > y)
							return 1;
						return 0; 
					});
					self.send(client, "getitems", {"count": docs.length, "result": docs});
				});

				break;
			case "getlogs":
				if (data.from === undefined || data.to === undefined) {
					return self.send(client, "status", {"status": "fail", "hash": null, "error": "from or to not defined"});
				}

				let fromDate = new Date(data.from);
				fromDate.setHours(0);
				fromDate.setMinutes(0);
				fromDate.setSeconds(0);
				fromDate.setMilliseconds(0);

				let toDate = new Date(data.to);
				toDate.setHours(0);
				toDate.setMinutes(0);
				toDate.setSeconds(0);
				toDate.setMilliseconds(0);

				let keys = [];
				let promises = [];

				for(var i = 0; fromDate.getTime() + i * 86400000 <= toDate.getTime(); i++ ) {
					keys.push(fromDate.getTime() + i * 86400000);
					promises.push(when.promise((resolve, reject) => {
						let key = path.join("databases", "sold", self.getTime(keys[i]) + ".db");

						try {
						    fs.accessSync(key, fs.F_OK);
						    let store = null;

							for(let x = 0; x < self.db.length; x++) {
								let db = self.db[x];
								if(db.key === key) {
									store = db.datastore;
									break;
								}
							}

							if (store === null) {
								store = new Datastore({ filename: key, autoload: true });
							    store.persistence.stopAutocompaction();
								self.db.push({key: key, datastore: store});
							}

						    store.find({}, (err, docs) => {
						    	docs = docs === null || docs === undefined ? [] : docs;
						    	resolve(docs);
						    });
						} catch (e) {
						    reject("not found");
						}
					}));
				}

				when.settle(promises).then(function(desc) {
					let payload = {count: desc.length, result: []};

					desc.forEach((item, index) => {
						let content = item.value !== undefined ? item.value : [];

						console.log(content);

						payload.result.push({
							"date": keys[index], 
							"label": self.getTime(keys[index]), 
							"sum": content.reduce((mem, item) => {
								return mem + item.total;
							}, 0),
							"content": content
						});	
					});

					self.send(client, "getlogs", payload);
				});

				break;
		}
	}

	retrieveItemDatabase() {

		if(this.itemdb === null) {
			this.itemdb = new Datastore({filename: path.join("databases", "items.db"), autoload: true});
		}

		return this.itemdb;
	}

	onWSConnection(ws) {
		let self = this;
		ws.on("message", (message) => {
			try {
				let data = JSON.parse(message);
				self.onMessage(ws, data.type, data.data);
			} catch (err) {
				console.log(err.message)
			}
		});
	}

	retrieveLogDatabase(key, cache) {
		let selected = null;
		cache = cache === undefined ? false : cache;

		if(typeof key === "string" || key instanceof String) {
			for(var i = 0; i < this.db.length; i++) {
				let db = this.db[i];

				if(db.key === key) {
					selected = db;
				} else if (cache === true) {
					this.db.splice(i, 1).datastore.persistence.stopAutocompaction();
				}
			}

			if(selected === null) {
				selected = { key: key, datastore: new Datastore({ filename: path.join("databases", "sold", key + ".db"), autoload: true }) };

				if (cache === true) {
					this.db.push(selected);
				}
			}	
		}

		return selected;
	}

	getTime(timestamp) {
		let date = timestamp === undefined ? new Date() : new Date(timestamp);
		return date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
	}

	getHash(data) {
		return md5(JSON.stringify(data));
	}

	isDatabase(selected) {
		return selected !== null && selected !== undefined && selected.datastore !== undefined && selected.datastore !== null;
	}
}

var app = express();
app.use(cors());

app.use("/api", new Server().middleware());
app.use("/client", express.static(__dirname + "/web"));
app.use("/warehouse", express.static(__dirname + "/warehouse/dist"));

app.listen(5116, () => {
	console.log("Running on port:", 5116);
});