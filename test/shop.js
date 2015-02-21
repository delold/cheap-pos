var expect = require("chai").expect;

var target = require("../assets/scripts/data/shop");

describe("shop.js", function() {
	describe("Shop", function() {
		it("has defaults", function() {
			var model = new target.Shop();

			expect(model.get("customerList")).to.be.an.instanceof(target.ShopCustomerCollection);
			expect(model.get("activeCustomer")).to.equal(0);
		});

		it("should get default customer", function() {
			var model = new target.Shop();

			expect(model.getCustomer()).to.be.an.instanceof(target.ShopCustomer);
			expect(model.getCustomer()).to.deep.equal(model.get("customerList").at(0));
		});

		it("should add & get customer", function() {
			var model = new target.Shop();
			var customer = new target.ShopCustomer();

			model.addCustomer(customer);

			expect(model.getCustomer(1)).to.deep.equal(customer);
			expect(model.getCustomer(0)).to.not.deep.equal(customer);
		});

		it("should set current customer", function() {
			var model = new target.Shop();
			var customer = new target.ShopCustomer();

			model.addCustomer(customer);
			model.setCurrent(1);

			expect(model.get("activeCustomer")).to.equal(1);
			expect(model.getCustomer()).to.deep.equal(model.getCustomer(1));
			expect(model.getCustomer()).to.not.deep.equal(model.getCustomer(0));
		});

		it("should remove customer", function() {
			var model = new target.Shop();
			var old_man = model.getCustomer();
			var new_man = new target.ShopCustomer();

			model.addCustomer(new_man);
			model.setCurrent(1);

			model.removeCustomer(0);

			expect(model.get("activeCustomer")).to.equal(0);
			expect(model.getCustomer(0)).to.equal(new_man);
		});


	});

	describe("ShopItem", function() {
		it("should calculate total", function() {
			var item = new target.ShopItem({"price": 300, "ammount": 2});

			expect(item.getTotal()).to.equal(600);

			item = new target.ShopItem({"price": 300, "ammount": -2});
			expect(item.getTotal()).to.equal(-600);
		});
	});

	describe("ShopCustomer", function() {
		var customer = {};

		beforeEach(function() {
			customer = new target.ShopCustomer();
		});

		it("has defaults", function() {
			expect(customer.get("mode")).to.equal("add");
			expect(customer.get("selectedItem")).to.equal(-1);

			expect(customer.get("itemList")).to.be.instanceof(target.ShopCart);
		});

		it("should add item correctly", function() {
			var new_item = new target.ShopItem();

			customer.addItem(new_item);

			expect(customer.get("itemList").at(0)).to.equal(new_item);
		});

		it("should get item correctly", function() {
			var x = new target.ShopItem();
			var y = new target.ShopItem();

			customer.addItem(x);
			expect(customer.get("itemList").at(0)).to.deep.equal(x);
			expect(customer.get("itemList").at(0)).to.deep.equal(customer.getItem(0));

			var added = customer.addItem(y);
			expect(customer.get("itemList").at(1)).to.deep.equal(y);
			expect(customer.get("itemList").at(1)).to.deep.equal(customer.getItem(1));
			expect(added).to.equal(1); //id
		});

		it("should get count", function() {
			expect(customer.getCount()).to.equal(0);

			customer.addItem(new target.ShopItem());
			customer.addItem(new target.ShopItem());

			expect(customer.getCount()).to.equal(2);
		});

		it("should remove item", function() {
			var x = new target.ShopItem();
			var y = new target.ShopItem();

			customer.addItem(x);
			customer.addItem(y);

			var removed = customer.removeItem(0);

			expect(removed).to.deep.equal(x);
			expect(customer.getItem(0)).to.deep.equal(y);
		});

		it("should get all items", function() {
			expect(customer.getItems()).to.deep.equal(customer.get("itemList"));
		});

		it("should remove all items", function() {
			customer.addItem(new target.ShopItem());
			customer.addItem(new target.ShopItem());
			customer.clearItems();

			expect(customer.getItems()).to.deep.equal(customer.get("itemList"));
			expect(customer.getCount()).to.equal(0);
			expect(customer.get("selectedItem")).to.equal(-1);
		});

		it("should get total correctly", function() {
			customer.addItem(new target.ShopItem({"price": 200, "ammount": 3}));
			customer.addItem(new target.ShopItem({"price": 600, "ammount": 1}));

			expect(customer.getTotal()).to.equal(1200);

			customer.addItem(new target.ShopItem({"price": -300, "ammount": 5}));
			expect(customer.getTotal()).to.equal(-300);
		});

		it("should set screen & mode", function() {
			customer.setScreen("300");

			expect(customer.get("screen")).to.equal("300");
			expect(customer.get("mode")).to.equal("add");

			customer.setScreen("500", "total");
			expect(customer.get("screen")).to.equal("500");
			expect(customer.get("mode")).to.equal("total");
		});	

		it("should add discount item at correct position", function() {
			//dummy items
			[1,2,3].forEach(function(ammount) {
				customer.addItem(new target.ShopItem({"price": ammount*100, "ammount": ammount}));
			});

			var positive = new target.ShopItem({"price": 100, "ammount": 1});
			var negative = new target.ShopItem({"price": -100, "ammount": 1});

			//first negative, then positive
			customer.addItem(negative); 
			customer.addItem(positive);

			expect(customer.get("itemList").indexOf(positive)).to.equal(3);
			expect(customer.get("itemList").indexOf(negative)).to.equal(4);
		});

		it("should remove discount items correctly", function() {
			var list = [1,-2,3,-4].map(function(ammount) {
				var item = new target.ShopItem({"price": ammount*100, "ammount": ammount});
				customer.addItem(item);

				return item;
			});

			//remove the last item, then the last item again
			customer.removeItem(3);
			customer.removeItem(2);

			expect(customer.getItem(0)).to.deep.equal(list[0]);
			expect(customer.getItem(1)).to.deep.equal(list[2]);
		})
	});
});
