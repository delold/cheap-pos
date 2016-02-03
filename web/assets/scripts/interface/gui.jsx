var data = require("../data/shop");
var mixins = require("../mixins");
var numberlib = require("../utils/number");
var keylib = require("../utils/key");


var React = require("react/addons");
var _ = require("underscore");

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
			return {customer: props.shop.getCustomer().toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.shop, 'all');
			// listenTo(props.shop.getCustomer().get("itemList"), "all");
	 	},
		render: function() {
			var shop = this.props.shop;
			var customer = shop.getCustomer();
	
			// var screen = numberlib.format(customer.get("screen"));
			var screen = shop.getBuffer();
			var total = customer.getTotal();

			console.log(screen);

			var decimalClass = (screen.indexOf(".") > -1) ? "decimal active" : "decimal";

			// var ret = customer.get("mode") == "cash" ? customer.get("payment") : Math.abs(total - Number.parseFloat(customer.get("payment")));
			// var ret_class = "return " + (customer.get("mode") == "cash" ? "payment" : (total - Number.parseFloat(customer.get("payment")) <= 0 ? "met" : ""));

			var ret = 0;
			var ret_class = "return payment";

			var cx = React.addons.classSet;
			var display = cx({
				"display": true,
				// "add": customer.get("mode") == "add" && (screen != "0.00" || total != 0),
				// "change": ["change", "cash"].indexOf(customer.get("mode")) != -1, 
				"change-met": true
			});

			screen = numberlib.format(screen).split(".");

			if (shop.getReverseMode()) {
				screen += "-";
			}

			// if len(self.cart) == 0:
			// 	self.confirm.config(text="Checkout")
			// 	self.confirm.state(["disabled"]) 
			// else:
			// 	label = ""
			// 	sumview = self.getCartSum()
			// 	addNumber = True

			// 	if self.mode == "return":
			// 		label = "Vrátit"
			// 		if self.clearMode == 1:
			// 			sumview = -sumview
			// 		else:
			// 			sumview = self.getValue() - sumview
			// 	elif self.clearMode == 2:
			// 		label = "Smazat"
			// 		addNumber = False
			// 	else:
			// 		label = "Účtovat"

			// 	if addNumber == True:
			// 		label = label + " " + self.getDisplayValue(sumview, divider=" ", dash=".", suffix=",- Kč")

			// 	self.confirm.config(text=label)
			// 	self.confirm.state(["!disabled"]) 

			return (
				<div className={display}>
					<span className="total">{screen[0]}<span className={decimalClass}>.{screen[1]}</span></span>
					<span className="helper">
						<span className="sum">{numberlib.format(total)}</span>
						<span className={ret_class}>{numberlib.format(ret)}</span>
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
			"0|1|2|3|4|5|6|7|8|9|,": function(event, key) {
				var buffer = this.props.shop.getBuffer();

				if (key === ",") {
					if (buffer.indexOf(".") == -1) {
						buffer += ".";
					} 
				} else {
					if(buffer.indexOf(".") > -1 && buffer.split(".")[1].length < 2) {
						buffer += key;				
					} else if (buffer.indexOf(".") == -1 || (buffer.indexOf(".") > -1 && buffer.split(".")[1].length < 2)) {
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

				if (mode === "return") {
					// self.mode = "input"
					// self.checkout(self.getValue())

					// self.buffer = self.getValue() - self.getCartSum()
					// self.clearMode = 2
					// self.setSelection("")
				} else {
					// self.addItem(self.buffer, discount=self.reverseMode)
					this.props.shop.setReverseMode(false);
					this.props.shop.setBuffer("");
				}
			}
		}
	}),
	Content: React.createClass({
		render: function() {
			return (
				<div className="content">
					<gui.Toolbar/>
					<gui.ShopList customer={this.props.shop.getCustomer()}/>
				</div>
			);
		}
	}),
	ShopList: React.createClass({
		mixins: [mixins.KeyboardEvents, mixins.BackboneEvents],
		getBackboneState: function (props) {
			return {customer: props.customer.toJSON(), items: props.customer.getItems().toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.customer, 'all');
			listenTo(props.customer.getItems(), "all")
	 	},
	 	onKeyPress: {
	 		up: function() {
	 			var val = this.props.customer.get("selectedItem") - 1;
	 			this.props.customer.set("selectedItem", Math.min(Math.max(val, 0), this.props.customer.getCount() - 1));
	 		},
	 		down: function() {
	 			var val = this.props.customer.get("selectedItem") + 1;
	 			this.props.customer.set("selectedItem", Math.min(Math.max(val, 0), this.props.customer.getCount() - 1));
	 		}
	 	},
		render: function() {
			var _this = this;
			var itemList = this.props.customer.getItems().map(function(item, position) {
				return (<gui.ShopItem item={{pos: position+1, data: item, active: (_this.props.customer.get("selectedItem") == position)}}/>);
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
				"active": this.props.item.active
			});
			return (
				<div className={classes}>
					<span className="poradi">{this.props.hint ? "#" : this.props.item.pos}</span>
					<span className="cena">{this.props.hint ? "Cena" : numberlib.format(this.props.item.data.get("price"), true, true,",- Kč")}</span>
					<span className="ks">{this.props.hint ? "Počet" : numberlib.format(this.props.item.data.get("ammount"), false, false, " ks")}</span>
					<span className="celkem">{this.props.hint ? "Součet" : numberlib.format(this.props.item.data.getTotal())}</span>
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