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
	WindowEvents: {
		componentDidMount: function() {
			if(typeof this.onResize !== "undefined") {
				window.addEventListener("resize", this.onResize);
			}
		},
		componentWillUnmount: function() {
			if(typeof this.onResize !== "undefined") {
				window.removeEventListener("resize", this.onResize);
			}
		},
		getWindowSize: function() {
			return {height: window.innerHeight, width: window.innerWidth};
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
		mixins: [app.gui.mixins.KeyboardEvents],
		onKeyPress: function(key) {
			if(key.type == app.Util.Key.menu) {
				this.setState({"menu": !this.state.menu});
			}
		},
		getInitialState: function() {
			return {"menu":false};
		},
		render: function() {
			return <div className={"app" + (this.state.menu ? " active" : "")}>
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
			//TODO: Přepracovat logiku
			var text = this.props.customer.get("screen");
			var mode = this.props.customer.get("mode");

			var type = press.type;
			var value = press.value;

			var Key = app.Util.Key;

			if(mode == "cash" || mode == "total") {
				text = "";

				if(mode == "cash") {
					mode = "add";
					this.props.customer.clearItems();
					return this.props.customer.setScreen(text, mode);
				} else if(mode == "total") {
					mode = "change";
				}
			}

			if([app.Util.Key.number, app.Util.Key.backspace, app.Util.Key.dot].indexOf(press.type) !== -1) {
				if(type == Key.number) {
					if (text.indexOf(".") > 0 && text.split(".")[1].length >= 2) 
						return;
					text += value;
				} else if (type == Key.backspace) {
					text = text.slice(0, -1);
				} else if (text.indexOf(".") === -1) {
					//TODO: upravit funkci desetinné čárky
					text += (text.length <= 0 ? "0" : "") + ".";
				}
			} else if (type == Key.enter) {
				if(!_.isFinite(text) || Number.parseFloat(text) <= 0) {
					return;
				}

				if(mode == "change") {
					text = this.props.customer.getTotal() - Number.parseFloat(text);
					mode = "cash";
				} else {
					var item = new app.shop.ShopItem({"price": Number.parseFloat(text), "ammount": 1});
					var selected = this.props.customer.addItem(item);
					this.props.customer.set("selectedItem", selected);
					
					text = "";
				}
			} else if (type == Key.cash) {
				mode = "total";
				text = this.props.customer.getTotal();
			} else if (type == Key.nudge || type == Key.delete) {
				var selected = this.props.customer.get("selected");
				if(selected < 0)
					return;

				var item = this.props.customer.getItem(selected);
				var nudge = (type == Key.delete) ? 0 : item.get("ammount")+value;

				if(nudge <= 0) {
					this.props.customer.removeItem(selected);
				} else {
					item.set("ammount", nudge);
				}
			} 

			this.props.customer.setScreen(text, mode);
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
				<div className="list"><app.gui.ShopItem hint="true"/><div className="items">{itemList}</div></div>
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
			return (<div className="toolbar"><app.gui.MenuBurger/><app.gui.Time/><app.gui.StatsChart /></div>);
		}
	}),
	MenuBurger: React.createClass({
		render: function() {
			return <div className="hamburger"><span className="middie" /></div>;
		}
	}),
	StatsChart: React.createClass({
		mixins: [app.gui.mixins.WindowEvents],
		getInitialState: function() {
			return _.pick(this.getWindowSize(), "width");
		},
		render: function() {
			return <canvas width="662" height="190"></canvas>;
		},
		onResize: function() {
			this.setState(this.getInitialState());
		},
		shouldComponentUpdate: function() {
			this.drawGraph([40, 200, 20, 60, 140, 169, 163, 50]);
			return false;
		},
		componentDidMount: function() {
			this.shouldComponentUpdate();
		},
		drawGraph: function(data) {
			var canvas = document.getElementsByTagName("canvas")[0];

			canvas.width = this.state.width * 0.6;


			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "rgba(25, 50, 125, 0.5)";
			ctx.strokeStyle = "rgb(25, 50, 125)";
			// ctx.setLineDash([5, 15]);
			ctx.lineWidth = 3;

			var yspace = 10;

			var height = canvas.height - yspace;
			var width = canvas.width;


			var max = _.max(data);


			// ctx.beginPath();
			// ctx.arc(75, 75, 50, 0, 2 * Math.PI);
			// ctx.stroke();
			

			
			ctx.beginPath();
			ctx.moveTo(0, height+yspace);
			ctx.lineTo(0, (height+yspace) - (height * (data[0] / max)));
			data.forEach(function(value, position) {
				var space = width / (data.length-1);
				
				var x1 = position * space;
				var x2 = (position+1) * space;

				var y1 = (height + yspace) - (height * (data[position] / max));
				var y2 = (height + yspace) - (height * (data[position+1] / max));

				ctx.bezierCurveTo(x1+(space/2),y1, x1+(space/2),y2 ,x2, y2);
			});
			ctx.lineTo(width, height+yspace);

			ctx.closePath();
			ctx.fill();

			data.forEach(function(value, position) {

				var space = width / (data.length-1);
				
				var x1 = position * space;
				var x2 = (position+1) * space;

				var y1 = (height + yspace) - (height * (data[position] / max));
				var y2 = (height + yspace) - (height * (data[position+1] / max));

				// ctx.beginPath();
				// ctx.arc(x1, y1, 5, 0, Math.PI*2);
				// ctx.fill();

				// ctx.beginPath();
				// ctx.moveTo(x1, y1);
				// ctx.lineTo(x2, y2);
				// ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.bezierCurveTo(x1+(space/2),y1, x1+(space/2),y2 ,x2, y2);

				ctx.stroke();
			});
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