var xhr = require("xhr");
var nodefn = require('when/node');

module.exports = {
	send: function(type, data) {
		return nodefn.call(xhr.post, "http://localhost:5116/api", {json: { type: type, data: data }}).then(function(response) {
			return response[0].body;
		});
	}
}