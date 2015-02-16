var app = app || {};
app.gui = app.gui || {};

app.gui.mixins = {
	KeyboardEvents: {
		componentDidMount: function() {
			app.Util.Key.addListener(this.onKeyPress);
		},
		componentWillUnmount: function() {
			app.Util.Key.removeListener(this.onKeyPress);
		}
	},
	BackboneEvents: {
		getInitialState: function () {
			return this.getBackboneState(this.props);
		},
		componentDidMount: function () {
			if (!_.isFunction(this.getBackboneState)) {
				throw new Error('You must provide getBackboneState(props).');
			}
			this._bindBackboneEvents(this.props);
		},
		componentWillReceiveProps: function (newProps) {
			this._unbindBackboneEvents();
			this._bindBackboneEvents(newProps);
		},

		componentWillUnmount: function () {
			this._unbindBackboneEvents();
		},

		_updateBackboneState: function () {
			var state = this.getBackboneState(this.props);
			this.setState(state);
		},

		_bindBackboneEvents: function (props) {
			if (!_.isFunction(this.watchBackboneProps)) {
				return;
			} else if (this._backboneListener) {
				throw new Error('Listener already exists.');
			} else if (!props) {
				throw new Error('Passed props are empty');
			}

			var listener = _.extend({}, Backbone.Events);
			listenTo = _.partial(listener.listenTo.bind(listener), _, _, this._updateBackboneState);

			this.watchBackboneProps(props, listenTo);
			this._backboneListener = listener;
		},

		_unbindBackboneEvents: function () {
			if (!_.isFunction(this.watchBackboneProps)) {
				return;
			} else if (!this._backboneListener) {
				throw new Error('Listener does not exist.');
			}
			this._backboneListener.stopListening();
			delete this._backboneListener;
		}	
	}
}

app.gui = {
	AppUI: React.createClass({
		render: function() {
			return <div className="app">
				<app.gui.Content {...this.props} />
				<app.gui.Sidebar {...this.props} />
			</div>;
		}
	}),
	Sidebar: React.createClass({
		render: function() {
			return <div className="sidebar"><app.gui.Customer customer={this.props.shop.getCustomer()}/></div>;
		}
	}),
	Customer: React.createClass({
		mixins: [app.gui.mixins.KeyboardEvents, app.gui.mixins.BackboneEvents],
		getBackboneState: function (props) {
			return {customer: props.customer.toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.customer, 'all');
			listenTo(props.customer.get("itemList"), "all");
	 	},
		render: function() {
			return (
				<div className="display">
					<span className="total">{app.Util.Number.format(this.props.customer.get("screen"))}</span>
					<span className="helper">{app.Util.Number.format(this.props.customer.getTotal())}</span>
				</div>
			);
		},
		onKeyPress: function(press) {
			var text = this.props.customer.get("screen");

			if(press.type == app.Util.Key.number && (text.indexOf(".") < 0 || (text.split(".")[1].length < 2))) {
				text += press.value;
			} else if (press.type == app.Util.Key.backspace && text.length > 0) {
				text = text.slice(0, (text.slice(-1) == ".") ? -2 : -1);
			} else if (press.type == app.Util.Key.dot && text.indexOf(".") < 0) {
				text += (text.length == 0 ? "0" : "") + press.value;
			} 

			if(press.type == app.Util.Key.nudge) {
				var selected = this.props.customer.get("selectedItem");
				if(selected >= 0 && selected < this.props.customer.getCount()) {
					var item = this.props.customer.getItem(selected);
					item.set("ammount", item.get("ammount") + press.value);

					if(item.get("ammount") <= 0) {
						this.props.customer.removeItem(selected);
						this.props.customer.set("selectedItem", Math.min(selected, this.props.customer.getCount()-1));
					}
				}
			}

			if(press.type == app.Util.Key.delete) {
				var selected = this.props.customer.get("selectedItem");
				if(selected >= 0 && selected < this.props.customer.getCount()) {
					this.props.customer.removeItem(selected);
					this.props.customer.set("selectedItem", Math.min(selected, this.props.customer.getCount()-1));
				}
			}

			if (press.type == app.Util.Key.enter && _.isFinite(text) && Number.parseFloat(text) != 0) {
				var item = new app.shop.ShopItem({"price": Number.parseFloat(text), "ammount": 1});
				var selected = this.props.customer.addItem(item);

				this.props.customer.set("selectedItem", selected);

				this.props.customer.set("screen", "");
			} else {
				this.props.customer.set("screen", text);
			}
		}
	}),
	Content: React.createClass({
		render: function() {
			return (
				<div className="content">
					<app.gui.Toolbar/>
					<app.gui.ShopList customer={this.props.shop.getCustomer()}/>
				</div>
			);
		}
	}),
	ShopList: React.createClass({
		mixins: [app.gui.mixins.KeyboardEvents, app.gui.mixins.BackboneEvents],
		getBackboneState: function (props) {
			return {customer: props.customer.toJSON()};
		},
		watchBackboneProps: function (props, listenTo) {
			listenTo(props.customer, 'all');
			listenTo(props.customer.get("itemList"), "all")
	 	},
	 	onKeyPress: function(key) {
	 		if(key.type == app.Util.Key.arrow) {
	 			var val = this.props.customer.get("selectedItem");
	 			if(key.value == app.Util.Key.arrowTypes.top) {
	 				val -= 1;
	 			} else if (key.value == app.Util.Key.arrowTypes.bottom) {
	 				val += 1;
	 			}

	 			this.props.customer.set("selectedItem", Math.min(Math.max(val, 0), this.props.customer.getCount() - 1));
	 		}
	 	},
		render: function() {
			var _this = this;
			var itemList = this.props.customer.getItems().map(function(item, position) {
				return (<app.gui.ShopItem item={{pos: position+1, data: item, active: (_this.props.customer.get("selectedItem") == position)}}/>);
			});
			return (
				<div className="list"><app.gui.ShopItem hint="true"/>{itemList}</div>
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
					<span className="cena">{this.props.hint ? "Cena" : app.Util.Number.format(this.props.item.data.get("price"), true, true,",- Kč")}</span>
					<span className="ks">{this.props.hint ? "Počet" : app.Util.Number.format(this.props.item.data.get("ammount"), false, false, " ks")}</span>
					<span className="celkem">{this.props.hint ? "Součet" : app.Util.Number.format(this.props.item.data.getTotal())}</span>
				</div>
			);
		}
	}),
	Toolbar: React.createClass({
		render: function() {
			return (<div className="toolbar"><app.gui.MenuBurger/><app.gui.Time/></div>);
		}
	}),

	MenuBurger: React.createClass({
		render: function() {
			return <div className="hamburger"><span className="middie" /></div>;
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