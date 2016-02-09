var React = require("react");
var ReactWinJS = require("react-winjs");

var gui = {
	Toolbar: React.createClass({
		render: function() {
			return (<ReactWinJS.ToolBar><ReactWinJS.ToolBar.Separator key="separator" /></ReactWinJS.ToolBar>)
		}
	}),
	Content: React.createClass({
		render: function() {
			return (<div className="stats">Ahoj světe</div>);
		}
	})
}

module.exports = gui;