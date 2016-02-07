var React = require("react");
var ReactWinJS = require("react-winjs");
var xhr = require("xhr");

var numberlib = require("../utils/number");

gui = {
	AppUI: React.createClass({
		handleTogglePane: function () {
			this.setState({ paneOpened: !this.state.paneOpened });
		},
		handleAfterClose: function () {
			this.setState({ paneOpened: false });
		},
		handleChangeContent: function (newContent, newLabel) {
			this.setState({
				content: newContent,
				label: newLabel,
				paneOpened: false
			});
		},
		getInitialState: function () {
			return {
				content: "find",
				label: "Najít zboží",
				paneOpened: false
			};
		},
		handleSubmit: function(data) {
			this.refs.form.clear();
			xhr.post("http://localhost:5116/api", {
				json: {
					type: "additem",
					data: data
				}
			}, function(err, response) {
				if (err !== undefined && err !== null) {
					console.log(err);
				} else {
					console.log(response);
					this.refs.list.update();
				}
			}.bind(this));
		},
		render: function () {
			var paneComponent = (
				<div>
					<div>
						<ReactWinJS.SplitViewPaneToggle
							aria-controls={"splitViewApp"}
							paneOpened={this.state.paneOpened}
							onInvoked={this.handleTogglePane} />
					</div>

					<ReactWinJS.SplitView.Command
						label="Najít zboží"
						icon="find"
						onInvoked={this.handleChangeContent.bind(null, "find", "Najít zboží")} />
					<ReactWinJS.SplitView.Command
						label="Správa zboží"
						icon="edit"
						onInvoked={this.handleChangeContent.bind(null, "edit", "Správa zboží")} />
					<ReactWinJS.SplitView.Command
						label="Statistiky"
						icon="view"
						onInvoked={this.handleChangeContent.bind(null, "stats", "Statistiky")} />
				</div>
			);

			var content = (<div id="content">
				<div id="toolbar">
					<span>{this.state.label}</span>
					<ReactWinJS.ToolBar>
						<ReactWinJS.ToolBar.Separator key="separator" />
					</ReactWinJS.ToolBar>
				</div>
			</div>);

			if (this.state.content == "edit") {
				content = (
					<div id="content">
						<div id="toolbar">
							<span>{this.state.label}</span>
							<ReactWinJS.ToolBar>
								<ReactWinJS.ToolBar.Button
									key="chooseMe"
									icon="add"
									onClick={this.handleShow}
									label="Přidat zboží" />
								<ReactWinJS.ToolBar.Separator key="separator" />
							</ReactWinJS.ToolBar>
						</div>
						<div className="edit">
							<gui.AddItemForm ref="form" onSubmit={this.handleSubmit} />
							<gui.ItemListView ref="list" />
						</div>
					</div>
				);
			} 
			return (
				<ReactWinJS.SplitView
					id={"splitViewApp"}
					className="win-type-body"
					paneComponent={paneComponent}
					contentComponent={content}
					paneOpened={this.state.paneOpened}
					onAfterClose={this.handleAfterClose} />
			);
		}
	}),
	AddItemForm: React.createClass({
		onClick: function() {
			if (this.props.onSubmit !== null) {
				this.props.onSubmit(this.state);
			}
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
		getDefaultProps: function() {
			return {onSubmit: null};
		},
		handleChange: function(event) {
			this.setState({[event.target.id]: event.target.value});
		},
		clear: function() {
			this.setState(this.getInitialState());
		},
		render: function() {
			return (
				<div className="form">
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
					<button className="win-button" onClick={this.onClick}>Přidat</button>
				</div>
			);
		}	
	}),
	ItemListView: React.createClass({
		itemRenderer: ReactWinJS.reactRenderer(function(item) {
			var contentComponent = <div className="win-type-body">{item.data.note}</div>
			return (<ReactWinJS.Tooltip className="item" contentComponent={contentComponent}>
				<div className="table">
					<span className="name">{item.data.name}</span>
					<span className="ks">{item.data.ks} ks</span>
					<span className="price">{numberlib.format(item.data.price)} Kč</span>
				</div>
			</ReactWinJS.Tooltip>);
		}),
		getInitialState: function () {
			return {
				data: [],
				list: new WinJS.Binding.List([]),
				layout: { type: WinJS.UI.ListLayout }
			};
		},
	   	update: function() {
	   		xhr.post("http://localhost:5116/api", {
				json: {type: "getitems"}
			}, function(err, response) {
				if (err !== undefined && err !== null && response !== undefined && response.body.data !== undefined) {
					console.log(err);
				} else {
					var data = response.body.data;
					var list = new WinJS.Binding.List(data.result);

					console.log(data.result);

					this.setState({data: data, list: list});
				}
			}.bind(this));
	   	},
	   	componentDidMount: function() {
	   		this.update();
	   	},
		render: function () {
			return (
				<ReactWinJS.ListView
					className="itemList win-selectionstylefilled win-type-body"
					itemDataSource={this.state.list.dataSource}
					itemTemplate={this.itemRenderer}
					layout={this.state.layout}
					selectionMode="single"
					tapBehavior="directSelect" />
			);
		}
	})
}

module.exports = gui;