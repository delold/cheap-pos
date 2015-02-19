var data = require("./data/shop");
var gui = require("./interface/gui");
var React = require("react");

var key = require("./utils/key");

var app = app || {};

app.Core = {
	load: function() {
		var json = JSON.parse('{"customerList":[{"itemList":[],"screen":""}],"activeCustomer":0}');

		var shop = new data.Shop(json);
		var customer = shop.getCustomer();

		React.render(React.createElement(gui.AppUI, {"shop":shop}), document.body);

		document.onkeydown = key.onKeyPress;
	}
}

app.Core.load();