var WSServer = require("ws").Server;
var Datastore = require("nedb");
var md5 = require("md5");

var http = require("http");
var path = require("path");

var App = {
	wss: null,
	port: 5116,
	db: [],
	start: function(port) {
		App.port = port;
		// App.wss = new WSServer({port: port});
		// App.wss.on("connection", App.onConnection);
		// App.wss.on("error", function(err) {
		// 	console.log(err)
		// });

		App.http = http.createServer(App.onHttpMessage)
		App.http.listen(App.port, function() {
			console.log("Starting on port: "+App.port);
		})

	},
	stop: function() {
		wss.clients.forEach(function(client) {
			App.send(client, "stop");
		});
	},
	onHttpMessage: function(request, response) {
		if(request.method == "POST" && request.headers["content-type"] === "application/json") {
			var body = "";
			request.on('data', function (data) {
				body += data;
				if (body.length > 1e6) {
					request.connection.destroy();
				}
			});

			request.on('end', function () {
				try {
					var data = JSON.parse(body);
					App.onMessage(response, data.type, data.data);
				} catch (err) {
					response.end(JSON.stringify({"type": "error", "data": 500}));
					console.log(err.message);
				}
			});
		} else {
			response.end(JSON.stringify({"type": "error", "data": 404}));
		}
	},
	send: function(client, type, data) {
		var payload = JSON.stringify({
			"type": type,
			"data": data
		});

		if (client instanceof http.ServerResponse) {
			client.end(payload);
		} else {
			client.send(payload);
		}
	},
	getTime: function(timestamp) {
		var date = timestamp === undefined ? new Date() : new Date(timestamp);
		return date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
	},
	getHash: function(data) {
		return md5(JSON.stringify(data));
	},
	onConnection: function(ws) {

		setInterval(function() {
			App.send(ws, "lol", {"Hello": "Hi"});
		}, 1000)

		ws.on("message", function(message) {
			try {
				var data = JSON.parse(message);
				App.onMessage(ws, data.type, data.data);
			} catch (err) {
				console.log(err.message)
			}
		});
	},
	retrieveDatabase: function(key, cache) {
		var selected = null;

		if(typeof key === "string" || key instanceof String) {
			cache = cache === undefined ? false : cache;

			for(var i = 0; i < App.db.length; i++) {
				var db = App.db[i];

				if(db.key === key) {
					selected = db;
				} else if (cache === true) {
					App.db.splice(i, 1).datastore.persistence.stopAutocompaction();
				}
			}

			if(selected === null) {
				selected = { key: key, datastore: new Datastore({ filename: path.join("databases", "sold", key + ".db"), autoload: true }) };

				if (cache === true) {
					App.db.push(selected);
				}
			}	
		}

		return selected;
	},
	isDatabase: function(selected) {
		return selected !== null && selected !== undefined && selected.datastore !== undefined && selected.datastore !== null;
	},
	onMessage: function(client, type, data) {
		console.log("onMessage: "+type);
		switch(type) {
			case "ping":
				App.send(client, "pong");
				break;
			case "open":
				break;
			case "total":
				var selected = App.retrieveDatabase(data);

				if(!App.isDatabase(selected)) {
					return App.send(client, "status", {"status": "fail", "hash": null, "error": "no db found"});
				}

				selected.datastore.find({}, function(err, docs) {
					if (err !== null) {
						App.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						var count = docs.length;
						var total = docs.reduce(function(sum, doc) {
							return sum + doc.total;
						}, 0);

						App.send(client, "total", {"count": count, "total": total});
					}
				})

				break;
			case "checkout":
				var selected = App.retrieveDatabase(App.getTime(data.date), true);
				
				if(!App.isDatabase(selected)) {
					return App.send(client, "status", {"status": "fail", "hash": null, "error": "no db found"});
				}

				selected.datastore.insert(data, function(err, newDoc) {
					if (err !== null) {
						App.send(client, "status", {"status": "fail", "hash": null, "error": err});
					} else {
						App.send(client, "status", {"status": "ok", "hash": App.getHash(newDoc)});
					}
				});

				break;
		}
	}
};

App.start(5116);