var WebSocket = require("ws");
// var ws = new WebSocket("ws://localhost:5116");

// ws.on("open", function() {
// 	ws.send(JSON.stringify({
// 		"type": "ping",
// 		"data": null
// 	}));
// });

// ws.on("message", function(data, flags) {
// 	console.log(data);
// 	var response = JSON.parse(data);
// 	switch(response.type) {
// 		case "pong":
// 			ws.send(JSON.stringify({
// 				"type": "checkout",
// 				"data": {
// 					"total": 2000,
// 					"date": (new Date()).getTime(),
// 					"items": [
// 						{"id": 0, "name": null, "barcode": 0, "amount": 20, "price": 20, "total": 400},
// 						{"id": 0, "name": null, "barcode": 0, "amount": 20, "price": 20, "total": 400},
// 						{"id": 0, "name": null, "barcode": 0, "amount": 20, "price": 20, "total": 400},
// 						{"id": 0, "name": null, "barcode": 0, "amount": 20, "price": 20, "total": 400},
// 						{"id": 0, "name": null, "barcode": 0, "amount": 20, "price": 20, "total": 400}
// 					]
// 				}
// 			}));
// 			ws.send(JSON.stringify({
// 				"type": "total",
// 				"data": "2.1.2016"
// 			}));
// 			break;
// 	}
// });

var keypress = require('keypress')
  , tty = require('tty');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
});

if (typeof process.stdin.setRawMode == 'function') {
  process.stdin.setRawMode(true);
} else {
  tty.setRawMode(true);
}
process.stdin.resume();

var blessed = require("blessed");

// var screen = blessed.screen({
// 	smartCSR: true,
// 	ignoreLocked: true,
// 	grabKeys: true,
// 	lockKeys: true
// });

// var box = blessed.bigtext({
// 	top: '0%+2',
// 	left: '0%+2',
// 	width: '70%-14',
// 	style: {
// 		fg: 'white',
// 		border: {
// 			fg: "#fff"
// 		}
// 	}
// });

// var table = blessed.table({
// 	top: "0%+2",
// 	left: "70%",
// 	width: "30%-2",
// 	data: [
// 	    ["#", "Cena", "Počet", "Celkem"],
// 	    ["1", "500,-", "1 ks", "500,-"]
// 	]
// });


// box.focus();

// // Append our box to the screen.
// screen.append(box);
// screen.append(table);

// screen.append(blessed.line({
// 	top: "0%",
// 	left: "70%",
// 	orientation: "vertical",
// 	height: "100%+2",
// 	type: "line",
// 	bg: "#fff"
// }));

// var test = "";

// function setBuffer(value) {
// 	var temp = test = value;

// 	if(temp.length <= 0) {
// 		temp = "0";
// 	}

// 	if(temp.indexOf(",") < 0) {
// 		temp += ",00";
// 	} else {
// 		for(var i = 0; i < 2 - test.split(",")[1].length; i++) {
// 			temp += "0";
// 		}
// 	}

// 	box.setContent(temp);
// 	screen.render();
// }

// screen.on("keypress", function(el, key) {
// 	if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ","].indexOf(key.full) >= 0) {
// 		if(key.full !== "," || (key.full === "," && test.indexOf(",") < 0)) {
// 			if(test.indexOf(",") < 0 || test.split(",")[1].length < 2) {
// 				if(test.length > 0 || key.full !== "0") {
// 					test += key.full;
// 				}
// 			}
// 		}

// 		setBuffer(test);
		
// 	} else if (key.full === "backspace") {
// 		setBuffer(test.slice(0, (test.slice(-1) === ",") ? -2 : -1));
// 	} else if (key.full === "enter") {
// 		setBuffer("");
// 	}

// 	if(key.full === "C-c") {
// 		process.exit(0);
// 	}
// });

// screen.render();
// setTimeout(function() {
// 	screen.render();

// }, 1000);