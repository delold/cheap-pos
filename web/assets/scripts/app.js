var Shop = require("./data/shop");
var Gui = require("./interface/gui");

var React = require("react");

var key = require("./utils/key");

(function() {
	key.setMousetrap(require("mousetrap"));

	var shop = new Shop.App();
	React.render(React.createElement(Gui.AppUI, {"shop":shop}), document.body);
	document.onkeydown = key.onKeyPress;
})();