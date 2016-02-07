//mousetrap shim
module.exports = {
	mousetrap: null,
	addListener: function(events, obj) {
		var before = events["_before"];
		var after = events["_after"];

		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				key.split("|").forEach(function(item) {
					module.exports.mousetrap.bind(item, function(event, code) {
						var success = this.before === undefined || this.before === null || this.before.call(obj, event, code) !== false;
						if (success) {
							var result = this.callback.call(obj, event, code);

							if(this.after !== undefined && this.after !== null) {
								this.after.call(obj, event, code, result);
							}
						}

						return false;
					}.bind({
						before: before,
						after: after,
						callback: events[key]
					}));
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