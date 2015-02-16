var app = app || {};
app.shop = app.shop || {};

app.shop.ShopItem = Backbone.Model.extend({
	defaults: {
		"price": 0,
		"ammount": 1
	},
	getTotal: function() {
		return this.get("price") * this.get("ammount");
	}
});

app.shop.ShopCart = Backbone.Collection.extend({
	model: app.shop.ShopItem
});

app.shop.ShopCustomer = Backbone.Model.extend({
	defaults: {
		"itemList": [], 
		"screen": "0"
	},
	addItem: function(shopItem) {
		this.get("itemList").add(shopItem);
	},
	getTotal: function() {
		return this.get("itemList").reduce(function(memo, item) {
			return memo + item.get("ammount")*item.get("price");
		}, 0);
	},
	getItems: function() {
		return this.get("itemList");
	},
	initialize: function() {
		this.set("itemList", new app.shop.ShopCart(this.get("itemList")))
	}
});

app.shop.ShopCustomerCollection = Backbone.Collection.extend({
	model: app.shop.ShopCustomer,
	initialize: function() {

	}
});

app.shop.Shop = Backbone.Model.extend({
	defaults: {
		"customerList": [],
		"activeCustomer": 0
	},
	addCustomer: function(customer) {
		this.get("customerList").add(customer);
	},
	getCustomer: function(customer) {
		customer = customer || this.get("activeCustomer");

		console.log(this.get("customerList"));

		return this.get("customerList").at(customer);
	},
	initialize: function() {
        this.set("customerList", new app.shop.ShopCustomerCollection(this.get("customerList")))
    }
});

