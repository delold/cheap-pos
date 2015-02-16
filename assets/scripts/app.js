var app = app || {};

app.Util = {
	Key: {
		number: 1, backspace: 2, enter: 3, nudge: 4, dot: 5, unknown: 6,
		listeners: [],
		fromKeyCode: function(key) {
			if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)){
			    return new this.Press(this.number, key-48 * ((key >= 96 && key <= 105)+1));
			} else if (key == 13) {
				return new this.Press(this.enter);
			} else if (key >= 107 && key <= 109) {
				return new this.Press(this.nudge, (key == 107) ? 1 : -1); 
			} else if (key == 8) {
				return new this.Press(this.backspace);
			} else if (key == 190 || key == 110) {
				return new this.Press(this.dot, ".");
			}

			if(key == 123) {
				require("nw.gui").Window.get().showDevTools();
			}


			return new this.Press(this.unknown);
		},
		onKeyPress: function(event) {
			var key = app.Util.Key.fromKeyCode((event.keyCode || event.charCode));
			var _this = app.Util.Key;

			_this.listeners.forEach(function(listener) {
				return typeof listener !== "undefined" ? listener(key) : false;
			});
		},
		addListener: function(callback) {
			this.listeners.push(callback);
		},
		removeListener: function(callback) {
			this.listeners = _.filter(this.listeners, function(cb) { return String(callback) != String(cb); });
		},
		Press: function(type, value) {
			this.type = type;
			this.value = value;
		}
	},
	Number: {
		format: function(number, decimal, groups, ending) {
			decimal = (typeof decimal === "undefined") ? true : decimal;
			groups = (typeof groups === "undefined") ? true : groups;
			ending = ending || "";

			var num = number.length || _.isNumber(number) ? number : String(0);
			
			num = Number.parseFloat(num).toFixed(decimal ? 2 : 0).toString().split(".");
    		num[0] = (groups) ? num[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") : num[0];

		    return num.join(".") + ending;
		}
	}
}

app.Core = {
	load: function() {
		// var shop = new app.shop.Shop();


		// var customer = shop.getCustomer();

		// var item = new app.shop.ShopItem({"price": 100, "ammount": 2});
		// customer.addItem(item);

		// React.render(React.createElement(app.gui.AppUI, {"shop":shop}), document.body);
		// console.log(JSON.stringify(shop));

		var json = JSON.parse('{"customerList":[{"itemList":[],"screen":""}],"activeCustomer":0}');

		var shop = new app.shop.Shop(json);
		var customer = shop.getCustomer();

		React.render(React.createElement(app.gui.AppUI, {"shop":shop}), document.body);
		// console.log(customer.getTotal())

		document.onkeydown = app.Util.Key.onKeyPress;
	},
	init: function() {
		if(typeof app.gui === "undefined" || typeof app.shop === "undefined") {
			return setTimeout(app.Core.init);
		}
		app.Core.load();
	}

}

app.Core.init();