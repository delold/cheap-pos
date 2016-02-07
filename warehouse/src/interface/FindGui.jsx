var React = require("react");
var ReactWinJS = require("react-winjs");

var gui = {
	getLabel: function() {
		return "Najít zboží";
	},
	getToolbar: function() {
		return [
			<ReactWinJS.ToolBar.Separator key="separator" />
		];
	},
	getContent: function() {
		return <gui.Content />
	},
	Content: React.createClass({
		render: function() {
			return <div>Ahoj světe</div>;
		}
	})
}

module.exports = gui;