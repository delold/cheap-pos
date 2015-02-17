var expect = require("chai").expect;

var npmPath = require("npm-path");
var nodeWebkit = require("nodewebkit");
var path = require("path");

var webdriverio = require("webdriverio");
var options = {desiredCapabilities: {
	browserName: "chrome",
	singleton: true
}};

describe("UI tests", function() {
	var client = {};

	this.timeout(3000);

	before(function(done) {
		this.timeout(0);

		client = webdriverio.remote(options).init();
		client.url("file://"+path.resolve("index.html"), done);
	
	});

	it("run the app in time", function(done) {
		client
			.waitForExist(".app",2000)
			.getTagName(".app", function(err) {
				expect(err).to.be.an("undefined");
			})
			.call(done);
	});

	describe("Display operations", function() {
		it("display numbers", function(done) {
			client
				.keys("12356")
				.getText(".total", function(err, text) {
					expect(text).to.equal("12,356.00");
				})
				.call(done);
		});

		it("remove numbers correctly", function(done) {
			client
				.keys(["\uE003", "\uE003", "\uE003", "\uE003"])
				.getText(".total", function(err, text) {
					expect(text).to.equal("1.00");
				})
				.call(done);
		});

		it("display decimals", function(done) {
			client
				.keys([".", "2", "0"])
				.getText(".total", function(err, text) {
					expect(text).to.equal("1.20");
				})
				.call(done);
		});

		it("remove decimal numbers properly", function(done) {
			client
				.keys(["\uE003"])
				.getText(".total", function(err,text) {
					expect(text).to.equal("1.20");
				})
				.keys(["\uE003", "\uE003"])
				.getText(".total", function(err, text) {
					expect(text).to.equal("1.00") //čárka je taky znak
				})
				.call(done);
		});
	});

	describe.skip("Math and list operations", function() {
		it("show items", function(done) {
			client
				.keys(["120", "\uE007", "250"])
				.getText(".total");
		});
	});

	after(function(done) {
		client.end(done);
	});
});