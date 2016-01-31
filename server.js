"use strict";

const WSServer = require("ws").Server;
const Datastore = require("nedb");
const md5 = require("md5");

const http = require("http");
const path = require("path");

class Server {
	constructor(port) {
		this.port = port;
		this.db = [];
		// this.wss = new WSServer({port: port});
		// this.wss.on("connection", this.onWSConnection.bind(this));
		// this.wss.on("error", function(err) {
		// 	console.log(err)
		// });
		this.wss = null;
		this.http = http.createServer(this.onHttpMessage.bind(this));
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

	onHttpMessage(request, response) {
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
				try {
					var data = JSON.parse(body);
					self.onMessage(response, data.type, data.data);
				} catch (err) {
					response.end(JSON.stringify({"type": "error", "data": 500}));
					console.log(err.message);
				}
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
		console.log("onMessage: "+type);
		let self = this;

		switch(type) {
			case "ping":
				self.send(client, "pong");
				break;
			case "open":
				break;
			case "total":
				var selected = self.retrieveDatabase(data);

				if(!self.isDatabase(selected)) {
					return self.send(client, "status", {"status": "fail", "hash": null, "error": "no db found"});
				}

				selected.datastore.find({}, (err, docs) => {
					if (err !== null) {
						self.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						var count = docs.length;
						var total = docs.reduce((sum, doc) => {
							return sum + doc.total;
						}, 0);

						self.send(client, "total", {"count": count, "total": total});
					}
				})

				break;
			case "checkout":
				var selected = self.retrieveDatabase(self.getTime(data.date), true);
				
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
		}
	}

	onWSConnection(ws) {
		let self = this;

		setInterval(() => {
			self.send(ws, "lol", {"Hello": "Hi"});
		}, 1000)

		ws.on("message", (message) => {
			try {
				let data = JSON.parse(message);
				self.onMessage(ws, data.type, data.data);
			} catch (err) {
				console.log(err.message)
			}
		});
	}

	retrieveDatabase(key, cache) {
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

new Server(5116).start();