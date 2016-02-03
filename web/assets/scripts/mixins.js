var keylib = require("./utils/key");

var Backbone = require("Backbone");
var _ = require("underscore");

mixins = {
	KeyboardEvents: {
		componentDidMount: function() {

			keylib.addListener(this.onKeyPress, this);
		},
		componentWillUnmount: function() {
			keylib.removeListener(this.onKeyPress, this);
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

module.exports = mixins;
