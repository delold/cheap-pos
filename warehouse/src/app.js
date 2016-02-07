require("./style.less");

var Gui = require("./interface/BaseGui.jsx");

var React = require("react");
var ReactDom = require("react-dom");

(function() {
	ReactDom.render(React.createElement(Gui.AppUI), document.getElementById("app"));
})();