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

	describe("ShopCustomer", function() {
		var customer = {};

		beforeEach(function() {
			customer = new target.ShopCustomer();
		});

		it("has defaults", function() {
			expect(customer.get("mode")).to.equal("add");
			expect(customer.get("selectedItem")).to.equal(-1);
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
			expect(customer.get("itemList").at(0)).to.equal(x);
			expect(customer.get("itemList").at(0)).to.equal(customer.getItem(0));

			customer.addItem(y);
			expect(customer.get("itemList").at(1)).to.equal(y);
			expect(customer.get("itemList").at(1)).to.equal(customer.getItem(1));
		});

		it("should get count", function() {
			expect(customer.getCount()).to.equal(0);

			customer.addItem(new target.ShopItem());
			expect(customer.getCount()).to.equal(1);
		});

		
	});
});
