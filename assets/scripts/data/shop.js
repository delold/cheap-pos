var Backbone = require("backbone");

var ShopItem = Backbone.Model.extend({
	defaults: {
		"price": 0,
		"ammount": 1
	},
	getTotal: function() {
		return this.get("price") * this.get("ammount");
	}
});

var ShopCart = Backbone.Collection.extend({
	model: ShopItem 
}); 

var ShopCustomer = Backbone.Model.extend({
	defaults: {
		"itemList": [], 
		"selectedItem": -1,
		"payment": 0,
		"screen": "",
		"mode": "add",
		"negativeCount": 0
	},
	addItem: function(shopItem) {
		var pos = this.get("itemList").length - ((shopItem.get("price") > 0) ? this.get("negativeCount") : 0);
		if(shopItem.get("price") < 0) {
			this.set("negativeCount", this.get("negativeCount")+1);
		}

		this.get("itemList").add(shopItem, {"at": pos});
		return pos;
	},
	getItem: function(position) {
		position = isFinite(position) ? position : this.get("selectedItem");
		return this.get("itemList").at(position);
	},
	removeItem: function(position) {
		var item = this.getItem(position);
		
		if(item.get("price") < 0) {
			this.set("negativeCount", this.get("negativeCount")-1);
		}
		return this.get("itemList").remove(item);
	},
	getCount: function() {
		return this.get("itemList").length;
	},
	getItems: function() {
		return this.get("itemList");
	},
	clearItems: function() {
		this.get("itemList").reset([]);
		this.set("selectedItem", -1);
	},
	getTotal: function() {
		return this.get("itemList").reduce(function(memo, item) {
			return memo + item.get("ammount")*item.get("price");
		}, 0);
	},
	setScreen: function(screen, mode) {
		mode = mode || "add";
		this.set("screen", String(screen));
		this.set("mode", mode);
	},
	initialize: function() {
		this.set("itemList", new ShopCart(this.get("itemList")))
	}
});

var ShopCustomerCollection = Backbone.Collection.extend({
	model: ShopCustomer
});

var Shop = Backbone.Model.extend({
	defaults: {
		"customerList": [{"itemList":[],"screen":""}],
		"activeCustomer": 0
	},
	addCustomer: function(customer) {
		this.get("customerList").add(customer);
	},
	getCustomer: function(number) {
		number = isFinite(number) ? number : this.get("activeCustomer");

		return this.get("customerList").at(number);
	},
	setCurrent: function(number) {
		this.set("activeCustomer", number);
	},
	removeCustomer: function(number) {
		var el = this.get("customerList").remove(this.getCustomer(number));

		if(this.get("activeCustomer")+1 >= this.get("customerList").length) {
			this.set("activeCustomer", this.get("customerList").length-1);
		}
	},
	initialize: function() {
        this.set("customerList", new ShopCustomerCollection(this.get("customerList")))
    }
});

module.exports = {
	"Shop": Shop,
	"ShopCustomerCollection": ShopCustomerCollection,
	"ShopCustomer": ShopCustomer,
	"ShopCart": ShopCart,
	"ShopItem": ShopItem
}