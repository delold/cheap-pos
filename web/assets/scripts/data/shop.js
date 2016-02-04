var Backbone = require("backbone");

var Item = Backbone.Model.extend({
	defaults: {
		iid: 0,	
		price: 0,
		total: 0,
		amount: 1,
		barcode: 0,
		discount: false,
		name: ""
	},
	incrementAmount: function(diff) {
		this.set("amount", Math.max(1, this.get("amount") + diff));
		this.set("total", this.get("price") * this.get("amount"));
	},
	getPrice: function() {
		return this.get("price");
	},
	getTotal: function() {
		return this.get("total");
	},
	getName: function() {
		return this.get("name");
	},
	getAmount: function() {
		return this.get("amount");
	},
	getDiscount: function() {
		return this.get("discount");
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
	addItem: function(shopItem, pos) {
		console.log(shopItem);

		if (!(shopItem instanceof Backbone.Model)) {
			shopItem = new Item(shopItem);
		}


		var pos = pos !== undefined ? pos : this.get("items").length;
		this.get("items").add(shopItem, {"at": pos});

		console.log(this.get("items").length);
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
	getCartSum: function() {
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
		buffer: "",
		selectedPos: 0,
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
	getMode: function() {
		return this.get("mode");
	},
	setMode: function(mode) {
		this.set("mode", mode);
	},
	getBuffer: function() {
		return this.get("buffer");
	},
	setBuffer: function(buffer) {
		this.set("buffer", buffer);
	},
	getClearMode: function() {
		return this.get("clearMode");
	},
	setClearMode: function(clearMode) {
		this.set("clearMode", clearMode);
	},
	getReverseMode: function() {
		return this.get("reverseMode");
	},
	setReverseMode: function(reverseMode) {
		this.set("reverseMode", reverseMode);
	},
	setSelectedPos: function(selectedPos) {
		this.set("selectedPos", selectedPos);
	},
	getSelectedPos: function() {
		return this.get("selectedPos");
	}
});

module.exports = {
	Item: Item,
	ItemList: ItemList,
	Customer: Customer,
	App: App
}