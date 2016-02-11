var React = require("react");
var ReactWinJS = require("react-winjs");

var Api = require("../utils/api");

var gui = {
	Toolbar: React.createClass({
		render: function() {
			return (<ReactWinJS.ToolBar><ReactWinJS.ToolBar.Separator key="separator" /></ReactWinJS.ToolBar>)
		}
	}),
	Content: React.createClass({
		render: function() {
			console.log()

			console.log("rendering");
			Api.send("getlogs", {"from": 1451606400000, "to": 1454198400000}).then(function(result) {
				console.log(result);
			}, function(err) {
				console.log(err);
			});

			return (<div className="stats">
				<h2 className="win-h2">Poslední test měsíc</h2>
			</div>);
		}
	})
}

module.exports = gui;