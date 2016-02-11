var React = require("react");
var ReactWinJS = require("react-winjs");

var numberlib = require("../utils/number");
var xhr = require("xhr");

var Api = require("../utils/api");

module.exports = React.createClass({
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
			data: {},
			list: new WinJS.Binding.List([]),
			layout: { type: WinJS.UI.ListLayout }
		};
	},
	updateRemote: function() {
		Api.send("getitems").then(function(response) {
			this.updateState(response.data);
		}.bind(this), function(err) {
			console.log(err);
		});
	},
   	updateState: function(data) {
   		if (data === undefined || data === null) {
			this.setState(this.getInitialState());
   		} else {
			this.setState({data: data, list: new WinJS.Binding.List(data.result)});
   		}
   	},
   	componentDidMount: function() {
   		if (this.props.data === undefined || this.props.data === false) {
   			this.updateRemote();
   		} else {
   			this.updateState(this.props.data);
   		}
   	},
   	componentWillReceiveProps: function(nextProps) {

   		if (JSON.stringify(this.props.data) === JSON.stringify(nextProps.data)) {
   			return;
   		}

   		if (nextProps.data === false && this.props.data !== false) {
   			this.updateRemote();
   		} else if (nextProps.data !== undefined) {
   			this.updateState(nextProps.data);
   		}
   	},
   	shouldComponentUpdate: function(nextProps, nextState) {

   		if (JSON.stringify(this.state.data) === JSON.stringify(nextState.data)) {
   			return false;
   		}

  //  		console.log(nextProps.data, this.props.data);
		// if(nextProps !== undefined && nextProps.data !== undefined && nextProps.data !== false && JSON.stringify(this.props.data) === JSON.stringify(nextProps.data)) {
		// 	return false;
		// } 
		return true;
	},
	render: function () {

		var classes = "itemList win-selectionstylefilled win-type-body" + ((this.state.data.count !== undefined && this.state.list.length <= 0) ? " empty" : "");

		return (
			<ReactWinJS.ListView
				className={classes}
				itemDataSource={this.state.list.dataSource}
				itemTemplate={this.itemRenderer}
				layout={this.state.layout}
				selectionMode="single"
				tapBehavior="directSelect" />
		);
	}
});