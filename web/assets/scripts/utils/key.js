//mousetrap shim
module.exports = {
	mousetrap: null,
	addListener: function(events, obj) {
		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				key.split("|").forEach(function(item) {
					module.exports.mousetrap.bind(item, function(event, code) {
						this.call(obj, event, code);
					}.bind(events[key]));
				});
			}
		}
	},
	removeListener: function(events) {
		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				key.split("|").forEach(function(item) {
					module.exports.mousetrap.unbind(item);
				});
			}
		}
	},
	setMousetrap: function(mousetrap) {
		module.exports.mousetrap = mousetrap;
	}
}