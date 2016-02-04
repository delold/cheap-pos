var data = require("../data/shop");
var mixins = require("../mixins");
var numberlib = require("../utils/number");
var keylib = require("../utils/key");


var React = require("react/addons");
var _ = require("underscore");
var xhr = require("xhr");

var gui = {};

gui = {
	AppUI: React.createClass({
		mixins: [mixins.KeyboardEvents],
		onKeyPress: {
			esc: function() {
				this.setState({"menu": !this.state.menu});
			}
		},
		getInitialState: function() {
			return {"menu":false};
		},
		render: function() {
			return <div className={"app" + (this.state.menu ? " active" : "")}>
				<gui.Content {...this.props} />
				<div className="sidebar">
					<gui.Customer {...this.props} />
				</div>
			</div>;
		}
	}),
	Customer: React.createClass({
		mixins: [mixins.KeyboardEvents, mixins.BackboneEvents],
		getBackboneState: function (props) {
			return {customer: props.shop.getCustomer().toJSON(), items: props.shop.getCustomer().getItems().toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.shop, 'change');
			listenTo(props.shop.getCustomer().getItems(), "all");
	 	},
		render: function() {
			var shop = this.props.shop;
			var customer = shop.getCustomer();
	
			var screen = shop.getBuffer();
			var total = customer.getCartSum();

			var decimalClass = (screen.indexOf(".") > -1) ? "decimal active" : "decimal";

			var ret = 0;
			var ret_class = "return payment";

			var cx = React.addons.classSet;
			var display = cx({
				"display": true,
				"add": shop.getMode() === "input" && customer.getCount() > 0,
				"change": shop.getMode() === "return" && customer.getCount() > 0,
				"change-met": shop.getMode() === "return" && shop.getClearMode() == 0 && parseFloat(screen) - total >= 0
			});

			var detail = cx({
				"return": true,
				"met": shop.getMode() === "return" && shop.getClearMode() == 0 && parseFloat(screen) - total >= 0
			});

			ret = shop.getClearMode() == 1 ? total : Math.abs(parseFloat(screen) - total);
			screen = numberlib.format(screen).split(".");


			if (shop.getReverseMode()) {
				screen[0] = "-"+screen[0];
			}

			return (
				<div className={display}>
					<span className="total">{screen[0]}<span className={decimalClass}>.{screen[1]}</span></span>
					<span className="helper">
						<span className="sum">{numberlib.format(total)}</span>
						<span className={detail}>{numberlib.format(ret)}</span>
					</span>
				</div>
			);
		},
		onKeyPress: {
			_before: function(event) {
				var clearMode = this.props.shop.getClearMode();

				if (clearMode > 0) {
					if (clearMode == 2) {
						this.props.shop.getCustomer().clearItems();
					}

					this.props.shop.setBuffer("");
					this.props.shop.setClearMode(0);
				}
			},
			"0|1|2|3|4|5|6|7|8|9|,|.": function(event, key) {
				var buffer = this.props.shop.getBuffer();

				if ([",", "."].indexOf(key) > -1) {
					if (buffer.indexOf(".") == -1) {
						buffer += (buffer.length > 0) ? "." : "0.";
					} 
				} else {
					if(buffer.indexOf(".") > -1) {
						if(buffer.split(".")[1].length < 2) {
							buffer += key;				
						}
					} else {
						if (buffer.length <= 0 && key !== "0") {
							buffer += key;
						} else if (buffer.split(".")[0].length < 7) {
							buffer += key;	
						}
					}
				}

				this.props.shop.setBuffer(buffer);
			},
			backspace: function(event, key) {
				var buffer = this.props.shop.getBuffer();
				if (buffer.length > 0) {
					buffer = buffer.slice(0, -1);

					if (buffer.slice(-1) === ".") {
						buffer = buffer.slice(0, -1);
					}

					this.props.shop.setBuffer(buffer);
				}
			},
			enter: function(event, key) {
				var buffer = this.props.shop.getBuffer();
				var mode = this.props.shop.getMode();
				var customer = this.props.shop.getCustomer();

				if (buffer.trim().length > 0) {
					if (mode === "return") {
						this.props.shop.setMode("input");
						var paid = parseFloat(buffer);
						var returned = paid - customer.getCartSum();

						xhr.post("http://localhost:5116/", {
							json: customer.toSubmit(paid)
						}, function(err, response) {
							if (err !== undefined && err !== null) {
								console.log(err);
							} else {
								console.log(response);
							}
						});

						console.log();

						this.props.shop.setBuffer(returned.toString()); // self.buffer = self.getValue() - self.getCartSum()
						this.props.shop.setClearMode(2);
						this.props.shop.setSelectedPos(-1);
					} else {
						var discount = this.props.shop.getReverseMode();
						
						var display = numberlib.format(buffer, true, true, ",-");
						var price = parseFloat(buffer);

						var targetpos = customer.getItems().length;
							

						if (discount == true) {
							console.log("discount", customer.getItems().filter(function(item) { 
								return item.getDiscount() === true; 
							}).length);
							price = price * -1;
							display = "Sleva";
						} else {
							targetpos -= customer.getItems().filter(function(item) { return item.getDiscount() === true; }).length;
						}

						customer.addItem({"iid":0,"name":display,"barcode":0,"amount":1,"price":price,"total":price, "discount": discount}, targetpos);
						
						this.props.shop.setSelectedPos(targetpos);
						this.props.shop.setReverseMode(false);
						this.props.shop.setBuffer("");
					}
				}
			},
			pageup: function(event, key) {
				var customer = this.props.shop.getCustomer();
				var mode = this.props.shop.getMode();

				if (mode !== "return" && customer.getCount() > 0) {
					this.props.shop.setMode("return");
					this.props.shop.setBuffer(customer.getCartSum().toString());
				// 	self.confirm.state(["disabled"])
				} else {
					this.props.shop.setMode("input");
					this.props.shop.setBuffer("");
				// 	self.confirm.state(["!disabled"])
				}

				this.props.shop.setReverseMode(false);
				this.props.shop.setClearMode(1);
			},
			home: function(event, key) {
				if (this.props.shop.getMode() !== "return") {
					this.props.shop.setReverseMode(!this.props.shop.getReverseMode());
				}
			}
		}
	}),
	Content: React.createClass({
		render: function() {
			return (
				<div className="content">
					<gui.Toolbar/>
					<gui.ShopList shop={this.props.shop}/>
				</div>
			);
		}
	}),
	ShopList: React.createClass({
		mixins: [mixins.KeyboardEvents, mixins.BackboneEvents],
		getBackboneState: function (props) {
			return {shop: props.shop.toJSON(), items: props.shop.getCustomer().getItems().toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.shop, 'all');
			listenTo(props.shop.getCustomer(), 'all');
			listenTo(props.shop.getCustomer().getItems(), "all")
	 	},
	 	onKeyPress: {
	 		_before: function(event) {
				var clearMode = this.props.shop.getClearMode();

				if (clearMode > 0) {
					if (clearMode == 2) {
						this.props.shop.getCustomer().clearItems();
					}

					this.props.shop.setBuffer("");
					this.props.shop.setClearMode(0);
				}
			},
	 		up: function() {
	 			var val = this.props.shop.getSelectedPos() - 1;
	 			this.props.shop.setSelectedPos(Math.min(Math.max(val, 0), this.props.shop.getCustomer().getCount() - 1));
	 		},
	 		down: function() {
	 			var val = this.props.shop.getSelectedPos() + 1;
	 			this.props.shop.setSelectedPos(Math.min(Math.max(val, 0), this.props.shop.getCustomer().getCount() - 1));
	 		},
	 		"+|-": function(event, key) {
	 			var customer = this.props.shop.getCustomer();
	 			var pos = this.props.shop.getSelectedPos();

	 			if (pos >= 0 && pos < customer.getCount()) {
	 				var item = customer.getItem(pos);
		 			
		 			if (item.getDiscount() == false) {
		 				item.incrementAmount(key === "+" ? 1 : -1);
		 			}
	 			}
	 		},
	 		del: function() {
	 			var shop = this.props.shop;
	 			var customer = shop.getCustomer();
	 			var pos = shop.getSelectedPos();

	 			if (pos >= 0 && pos < customer.getCount()) {
	 				customer.removeItem(pos);

	 				if(customer.getCount() <= 0 && shop.getMode() === "return") {
	 					shop.setMode("input");
	 				}

	 				if (pos == customer.getCount()) {
	 					shop.setSelectedPos(pos - 1);
	 				}
 				}
	 		}
	 	},
		render: function() {
			var _this = this;
			var itemList = this.props.shop.getCustomer().getItems().map(function(item, position) {
				return (<gui.ShopItem pos={position+1} active={_this.props.shop.getSelectedPos() == position} item={item}/>);
			});
			return (
				<div className="list"><gui.ShopItem hint="true"/><div className="items">{itemList}</div></div>
			);
		}
	}),
	ShopItem: React.createClass({
		getDefaultProps: function() {
			return {"hint":false, "item": {}};
		},
		render: function() {
			var cx = React.addons.classSet;
			var classes = cx({
				"label": this.props.hint,
				"item": !this.props.hint,
				"active": this.props.active
			});
			return (
				<div className={classes}>
					<span className="poradi">{this.props.hint ? "#" : this.props.item.getDiscount() ? "" : this.props.pos}</span>
					<span className="nazev">{this.props.hint ? "Název" : this.props.item.getName()}</span>
					<span className="ks">{this.props.hint ? "Počet" : this.props.item.getDiscount() ? "" : numberlib.format(this.props.item.getAmount(), false, false, " ks")}</span>
					<span className="zaks">{this.props.hint ? "Cena za ks" : this.props.item.getDiscount() ? "" : numberlib.format(this.props.item.getTotal())}</span>
					<span className="celkem">{this.props.hint ? "Celkem" : numberlib.format(this.props.item.getTotal())}</span>
				</div>
			);
		}
	}),
	Toolbar: React.createClass({
		render: function() {
			return (<div className="toolbar">
				<div className="hamburger"><span className="middie" /></div>
				<gui.Time/>
			</div>);
		}
	}),
	Time: React.createClass({
		reloadTime: function() {
			var date = new Date();
			var padNumber = function(number) { return (typeof number === "number" && number <= 9) ? "0"+number : number; }

			return [date.getDate(), ". ", 
						date.getMonth()+1, ". ", 
						date.getFullYear(), " ", 
						date.getHours(), ":", date.getMinutes(), ":", date.getSeconds()]
					.map(padNumber).join("");
		},
		getInitialState: function() {
			var time = this.reloadTime();
			return {string: time};
		},
		componentDidMount: function() {
			var _this = this;
			var update = function() {
				_this.setState(_this.getInitialState());
				_this.frame = requestAnimationFrame(update);
			};

			this.frame = requestAnimationFrame(update);
		},
		componentWillUnmount: function() {
			cancelAnimationFrame(this.frame);
		},
		render: function() {
			return (<span className="time">{this.state.string}</span>);
		}
	})
}

module.exports = gui;