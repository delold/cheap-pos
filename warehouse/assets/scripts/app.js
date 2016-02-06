// var Shop = require("./data/shop");
var Gui = require("./interface/gui");

var React = require("react");
var ReactDom = require("react-dom");

// var key = require("./utils/key");

(function() {
	// key.setMousetrap(require("mousetrap"));
	// var shop = new Shop.App();
	ReactDom.render(React.createElement(Gui.AppUI), document.body);
	// document.onkeydown = key.onKeyPress;
})();