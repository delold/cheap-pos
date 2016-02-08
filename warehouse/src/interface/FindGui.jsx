var React = require("react");
var ReactWinJS = require("react-winjs");

var xhr = require("xhr");

var ListView = require("./ListView.jsx");

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
		handleChange: function(event) {
			this.setState({query: event.target.value});
		},
		handleSubmit: function(event) {
			event.preventDefault();

			xhr.post("http://localhost:5116/api", {
				json: {
					type: "getitem",
					data: {
						type: "name",
						query: this.state.query
					}
				}
			}, function(err, response) {
				if (err !== undefined && err !== null) {
					console.log(err);
				} else {
					console.log(response.body.data);
					this.setState({data: response.body.data});
				}
			}.bind(this));
		},
		getInitialState: function() {
			return {query: "", data: null};
		},
		render: function() {
			console.log(this.state.data);
			return <div className="search">
				<h2 className="win-h2">Najít zboží</h2>
				<p>Stačí zadat název</p>
				<form className="searchbox" onSubmit={this.handleSubmit}>
					<input className="win-textbox win-interactive" type="text" onChange={this.handleChange}/>
					<button type="submit" className="win-button win-icon">{WinJS.UI.AppBarIcon.find}</button>
				</form>
				<ListView data={this.state.data} />
			</div>;
		}
	})
}

module.exports = gui;