var _ = require("underscore");

module.exports = {
	format: function(number, decimal, groups, ending) {
		decimal = (typeof decimal === "undefined") ? true : decimal;
		groups = (typeof groups === "undefined") ? true : groups;
		ending = ending || "";

		var num = number.length || _.isNumber(number) ? number : String(0);
		
		num = Number.parseFloat(num).toFixed(decimal ? 2 : 0).toString().split(".");
		num[0] = (groups) ? num[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") : num[0];

	    return num.join(".") + ending;
	}
}