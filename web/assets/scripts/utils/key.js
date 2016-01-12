module.exports = {
	number: 1, backspace: 2, enter: 3, nudge: 4, dot: 5, arrow: 6, delete: 7, menu: 8, cash: 9, tab: 10, unknown: -1,
	arrowTypes: {left:1, top: 2, right: 3, bottom: 4},
	listeners: [],
	fromKeyCode: function(key) {
		//TODO: find better ways to map
		if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)){
		    return new this.Press(this.number, key-48 * ((key >= 96 && key <= 105)+1));
		} else if (key == 13) {
			return new this.Press(this.enter);
		} else if (key >= 107 && key <= 109) {
			return new this.Press(this.nudge, (key == 107) ? 1 : -1); 
		} else if (key == 8) {
			return new this.Press(this.backspace);
		} else if (key == 190 || key == 110) {
			return new this.Press(this.dot, ".");
		} else if (key >= 37 && key <= 40) {
			return new this.Press(this.arrow, key - 36);
		} else if (key == 46) {
			return new this.Press(this.delete);
		} else if (key == 27) {
			return new this.Press(this.menu);
		} else if (key == 33) {
			return new this.Press(this.cash);
		} else if (key == 9) {
			return new this.Press(this.tab);
		}

		// console.info(key);

		return new this.Press(this.unknown);
	},
	onKeyPress: function(event) {
		var _this = module.exports;

		var key = _this.fromKeyCode((event.keyCode || event.charCode));

		_this.listeners.forEach(function(listener) {
			return typeof listener !== "undefined" ? listener(key) : false;
		});

		event.preventDefault();
	},
	addListener: function(callback) {
		this.listeners.push(callback);
	},
	removeListener: function(callback) {
		this.listeners = _.filter(this.listeners, function(cb) { return String(callback) != String(cb); });
	},
	Press: function(type, value) {
		this.type = type;
		this.value = value;
	}
}