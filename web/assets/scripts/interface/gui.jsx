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
		// mixins: [mixins.KeyboardEvents, mixins.BackboneEvents],
		mixins: [mixins.KeyboardEvents],
		getBackboneState: function (props) {
			return {customer: props.shop.getCustomer().toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.shop.getCustomer(), 'all');
			listenTo(props.shop.getCustomer().get("itemList"), "all");
	 	},
		render: function() {
			var shop = this.props.shop;
			var customer = shop.getCustomer();
	
			// var screen = numberlib.format(customer.get("screen"));
			var screen = shop.getBuffer();
			var total = customer.getTotal();
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
		determineAction: function(press) {
			var text = this.props.customer.get("screen");
			var mode = this.props.customer.get("mode");

			var type = press.type;
			var value = press.value;
			//modes: [add, total, change, cash];

			function set(new_text, new_mode) {
				new_text = typeof new_text === "undefined" ? text : new_text;
				new_mode = typeof new_mode === "undefined" ? mode : new_mode;

				return {"text": new_text, "mode": new_mode};
			}

			if(mode == "cash" || mode == "total") {
				text = "";

				if(mode == "cash") {
					mode = "add";
					this.props.customer.clearItems();

					return set(text, mode);
				} else if(mode == "total") {
					mode = "change";
				}
			}

			if (type == keylib.cash) {
				
				if(this.props.customer.getTotal() != 0) {
					return set(this.props.customer.getTotal(), "total");
				}

			} else if([keylib.number, keylib.backspace, keylib.dot].indexOf(press.type) !== -1) {
				if(type == keylib.number) {
					if (text.indexOf(".") >= 0 && text.split(".")[1].length >= 2) {
						return set();
					}
					text += value;
				} else if (type == keylib.backspace) {
					text = text.slice(0, -1);
				} else if (text.indexOf(".") === -1) {
					//TODO: upravit funkci desetinné čárky
					text += (text.length <= 0 ? "0" : "") + ".";
				}

				if(mode == "change") {
					this.props.customer.set("payment", text);
				}
			} else if (type == keylib.enter) {
				if(!_.isFinite(text) || Number.parseFloat(text) <= 0) {
					return set();
				}

				if(mode == "change") {
					text = this.props.customer.getTotal() - Number.parseFloat(text);
					mode = "cash";
				} else {
					var item = new data.ShopItem({"price": Number.parseFloat(text), "ammount": 1});
					var selected = this.props.customer.addItem(item);
					this.props.customer.set("selectedItem", selected);
					
					text = "";
				}
			} else if (type == keylib.nudge || type == keylib.delete) {
				var selected = this.props.customer.get("selectedItem");

				if(selected < 0) {
					return set();
				}
				
				var item = this.props.customer.getItem(selected);
				var nudge = (type == keylib.delete) ? 0 : item.get("ammount")+value;


				if(nudge <= 0) {
					this.props.customer.removeItem(selected);

					if(selected+1 >= this.props.customer.getCount()) {
						this.props.customer.set("selectedItem", this.props.customer.getCount()-1)
					}
				} else {
					item.set("ammount", nudge);
				}
			} 

			return set(text,mode);
		},
		onKeyPress: {
			"0|1|2|3|4|5|6|7|8|9|,": function(event, code) {
				console.log(code);
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