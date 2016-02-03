var Backbone = require("backbone");

var Item = Backbone.Model.extend({
	defaults: {
		id: 0,	
		price: 0,
		total: 0,
		amount: 1,
		barcode: 0,
		discount: false,
		name: ""
	},
	incrementAmount: function(diff) {
		this.set("amount", this.get("amount") + diff);
		this.set("total", this.get("price") * this.get("amount"));
	}
});

var ItemList = Backbone.Collection.extend({ model: Item });

var Customer = Backbone.Model.extend({
	defaults: {
		date: 0,
		total: 0,
		paid: 0,
		returned: 0,
		items: []
	},
	addItem: function(shopItem) {
		// var pos = this.get("itemList").length - ((shopItem.get("price") > 0) ? this.get("negativeCount") : 0);
		// this.get("itemList").add(shopItem, {"at": pos});
		this.get("items").add(shopItem);
		return pos;
	},
	getItem: function(position) {
		return this.get("items").at(position);
	},
	removeItem: function(position) {
		return this.get("items").remove(this.getItem(position));
	},
	getCount: function() {
		return this.get("items").length;
	},
	getItems: function() {
		return this.get("items");
	},
	clearItems: function() {
		this.get("items").reset([]);
	},
	getTotal: function() {
		return this.get("items").reduce(function(memo, item) {
			return memo + item.get("amount") * item.get("price");
		}, 0);
	},
	initialize: function() {
		this.set("items", new ItemList(this.get("items")))
	}
});

var App = Backbone.Model.extend({
	defaults: {
		mode: "input",
		reverseMode: false,
		clearMode: 0,
		buffer: "0.00",
		customer: null
	},
	initialize: function() {
		var customer = this.get("customer");

		if (customer == null) {
			customer = new Customer();
		} else if (!(customer instanceof Backbone.Model)) {
			customer = new Customer(customer);
		}

		this.set("customer", customer);
	},
	getCustomer: function() {
		return this.get("customer");
	},
	getBuffer: function() {
		return this.get("buffer");
	},
	setBuffer: function(buffer) {
		this.set("buffer", buffer);
	},
	setMode: function(mode) {
		this.set("mode", mode);
	},
});

module.exports = {
	Item: Item,
	ItemList: ItemList,
	Customer: Customer,
	App: App
}