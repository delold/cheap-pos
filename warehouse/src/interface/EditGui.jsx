var React = require("react");
var ReactWinJS = require("react-winjs");

var ListView = require("./ListView.jsx");
var ItemForm = require("./ItemForm.jsx");

var Api = require("../utils/api");

module.exports = {
	Content: React.createClass({
		handleSubmit: function(data) {
			this.refs.form.clear();
			Api.send("additem", data).then(function(response) {
				this.refs.list.updateRemote();
			}.bind(this), function(err) {
				console.log(err);
			});
		},
		handleAction: function(type, data) {
			if (type == "showForm") {
				this.setState({showForm: !this.state.showForm});
			} else if (type == "search") {
				this.setState({"searchResult": data});
			}
		},
		getInitialState: function() {
			return { showForm: false, "searchResult": false };
		},
		render: function() {
			return (<div className={this.state.showForm ? "edit small" : "edit" }>
				{this.state.showForm ? <ItemForm ref="form" show={this.state.showForm} onSubmit={this.handleSubmit} /> : null}
				<ListView data={this.state.searchResult} ref="list" />
			</div>)
		}
	}),
	Toolbar: React.createClass({
		handleChange: function(event) {
			this.setState({query: event.target.value});
		},
		handleSubmit: function(event) {
			event.preventDefault();
			if (this.state.query.trim().length == 0) {
				this.props.callback("search", false);			
			} else {
				Api.send("getitem", { type: "name", query: this.state.query }).then(function(response) {
					this.props.callback("search", response.data);
				}.bind(this), function(err) {
					console.log(err);
				});
			}
		},
		getInitialState: function() {
			return {query: ""};
		},
		handleShowClick: function() {
			this.props.callback("showForm");
		},
		render: function() {
			return (
				<ReactWinJS.ToolBar>
					<ReactWinJS.AppBar.ContentCommand key="content" icon="accept" label="Accept">
                        <form className="searchbox" onSubmit={this.handleSubmit}>
							<input autoComplete="off" className="win-textbox win-interactive" placeholder="Název nebo UPC" type="text" onChange={this.handleChange}/>
							<button type="submit" className="win-button win-icon">{WinJS.UI.AppBarIcon.find}</button>
						</form>
                    </ReactWinJS.AppBar.ContentCommand>
					<ReactWinJS.ToolBar.Separator key="separator" />
					<ReactWinJS.ToolBar.Button key="showForm" icon="add" onClick={this.handleShowClick} label="Přidat zboží" />
				</ReactWinJS.ToolBar>
			)
		}
	})
}