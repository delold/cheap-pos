var React = require("react");
var ReactWinJS = require("react-winjs");
var xhr = require("xhr");

gui = {
	AppUI: React.createClass({
		handleTogglePane: function () {
	        this.setState({ paneOpened: !this.state.paneOpened });
	    },
	    handleAfterClose: function () {
	        this.setState({ paneOpened: false });
	    },
	    handleChangeContent: function (newContent) {
	        this.setState({
	            content: newContent,
	            paneOpened: false
	        });
	    },
	    getInitialState: function () {
	        return {
	            content: "Home",
	            paneOpened: false
	        };
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
	                    onInvoked={this.handleChangeContent.bind(null, "Home")} />
	                <ReactWinJS.SplitView.Command
	                    label="Správa zboží"
	                    icon="edit"
	                    onInvoked={this.handleChangeContent.bind(null, "Favorite")} />
	                <ReactWinJS.SplitView.Command
	                    label="Statistiky"
	                    icon="view"
	                    onInvoked={this.handleChangeContent.bind(null, "Settings")} />
	            </div>
	        );
	        var contentComponent = (
	            // <h2 className="win-h2" style={{marginLeft: "10px"}}>{this.state.content}</h2>
	            <div id="content">
	            	<div id="toolbar">
	            		<span>{this.state.content}</span>
	            		<ReactWinJS.ToolBar><ReactWinJS.ToolBar.Separator key="separator" /></ReactWinJS.ToolBar>
	            	</div>
	            	
	            	<gui.AddItemForm />
	            	<gui.ItemListView />
	            </div>
	        );

	        return (
	            <ReactWinJS.SplitView
	                id={"splitViewApp"}
	                className="win-type-body"
	                paneComponent={paneComponent}
	                contentComponent={contentComponent}
	                paneOpened={this.state.paneOpened}
	                onAfterClose={this.handleAfterClose} />
	        );
	    }
	}),
	AddItemForm: React.createClass({
		onClick: function() {
			xhr.post("http://localhost:5116/api", {
				json: {
					type: "additem",
					data: this.state
				}
			}, function(err, response) {
				if (err !== undefined && err !== null) {
					console.log(err);
				} else {
					console.log(response);
				}
			});
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
		handleChange: function(event) {
			this.setState({[event.target.id]: event.target.value});
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
		itemRenderer: ReactWinJS.reactRenderer(function (item) {
	        return <div>{item.data.title}</div>;
	    }),
	    getInitialState: function () {
	        return {
	            list: new WinJS.Binding.List([
	                { title: "Apple" },
	                { title: "Banana" },
	                { title: "Grape" },
	                { title: "Lemon" },
	                { title: "Mint" },
	                { title: "Orange" },
	                { title: "Pineapple" },
	                { title: "Strawberry"}
	            ]),
	            layout: { type: WinJS.UI.ListLayout }
	        };
	    },
	    render: function () {
	        return (
	            <ReactWinJS.ListView
	                className="listViewExample win-selectionstylefilled win-type-body"
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