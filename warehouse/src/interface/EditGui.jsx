var React = require("react");
var ReactDom = require("react-dom");
var ReactWinJS = require("react-winjs");

var numberlib = require("../utils/number");
var xhr = require("xhr");

var ListView = require("./ListView.jsx");

var Api = require("../utils/api");

var gui = {
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
		handleShow: function() {
			if (this.isMounted()) {
				this.setState({ showForm: !this.state.showForm });
			} else {
				console.log("Not mounted");
			}
		},
		componentDidUpdate: function() {
			gui.showListener = this;
		},
		componentWillUnmount: function() {
			gui.showListener = null;
		},
		render: function() {
			return (<div className={this.state.showForm ? "edit small" : "edit" }>
				{this.state.showForm ? <gui.Form ref="form" show={this.state.showForm} onSubmit={this.handleSubmit} /> : null}
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
			console.log("hi");
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
	}),
	Form: React.createClass({
		handleClick: function() {
			if (this.props.onSubmit !== null) {
				this.props.onSubmit(this.state);
			}
		},
		propTypes: {
			onSubmit: React.PropTypes.func.isRequired
		},
		clear: function() {
			this.setState(this.getInitialState());
		},
		getInitialState: function() {
			return {
				name: "",
				price: "0.00",
				ks: "1",
				prevprice: "0.00",
				upc: "",
				note: ""
			}
		},
		componentDidMount: function() {
			WinJS.UI.Animation.enterContent(React.findDOMNode(this.refs.animate)).done();
		},
		getDefaultProps: function() {
			return {onSubmit: null};
		},
		handleChange: function(event) {
			this.setState({[event.target.id]: event.target.value});
		},
		render: function() {
			return (
				<div className="sidebar">
					<div ref="animate" className="form">
						<h2 className="win-h2">Přidat zboží</h2>
						<div className="input-group">
							<label htmlFor="name">Název</label><input className="win-textbox win-interactive" id="name" type="text" onChange={this.handleChange} value={this.state.name} />
						</div>
						<div className="input-group">
							<label htmlFor="price">Cena</label>
							<div className="scale">
								<input className="win-textbox win-interactive" id="price" type="number" min="0.00" step="1.00" onChange={this.handleChange} value={this.state.price} /><span>Kč</span>
							</div>
						</div>
						<div className="input-divide">
							<div className="input-group input-group-half">
								<label htmlFor="ks">Počet kusů</label>
								<div className="scale">
									<input className="win-textbox win-interactive" id="ks" type="number" min="1" onChange={this.handleChange} value={this.state.ks} /><span>ks</span>
								</div>
							</div>
							<div className="input-group input-group-half">
								<label htmlFor="prevprice">Původní cena</label>
								<div className="scale">
									<input className="win-textbox win-interactive" id="prevprice" type="number" min="0.00" step="1.00" onChange={this.handleChange} value={this.state.prevprice} /><span>Kč</span>
								</div>
							</div>
						</div>
						<div className="input-group">
							<label htmlFor="upc">Čárový kód</label>
							<div className="scale">
								<input className="win-textbox win-interactive" id="upc" type="number" min="1" onChange={this.handleChange} value={this.state.upc} /><button className="win-button">Oskenovat</button>
							</div>
						</div>
						<div className="input-group">
							<label htmlFor="note">Poznámka</label>
							<input className="win-textbox win-interactive" id="note" type="text" onChange={this.handleChange} value={this.state.note} />
						</div>
						<button className="win-button win-submit" onClick={this.handleClick}>Přidat</button>
					</div>
					
				</div>
			);
		}
	})
}

module.exports = gui;