process.on("uncaughtException", function(e) {  });

function bindKey() {
	if(typeof window === "undefined") {
		return setTimeout(bindKey, 10);
	}

	window.onkeyup = function(e) {
		if(e.keyCode == 123) {
			window.require("nw.gui").Window.get().showDevTools();
		}
	}
}

bindKey();
