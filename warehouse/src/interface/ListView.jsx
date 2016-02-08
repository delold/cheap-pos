var React = require("react");
var ReactWinJS = require("react-winjs");

var numberlib = require("../utils/number");
var xhr = require("xhr");

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
   		xhr.post("http://localhost:5116/api", {
			json: {type: "getitems"}
		}, function(err, response) {
			if (err !== undefined && err !== null && response !== undefined && response.body.data !== undefined) {
				console.log(err);
			} else {
				this.updateState(response.body.data);
			}
		}.bind(this));
   	},
   	updateState: function(data) {
   		if (data === undefined || data === null) {
			this.setState(this.getInitialState());
   		} else {
			this.setState({data: data, list: new WinJS.Binding.List(data.result)});
   		}
   	},
   	componentDidMount: function() {
   		console.log(this.props);
   		if (this.props.data === undefined) {
   			this.updateRemote();
   		} else {
   			this.updateState(this.props.data);
   		}
   	},
   	componentWillReceiveProps: function(nextProps) {
   		if (nextProps.data !== undefined) {
   			this.updateState(nextProps.data);
   		}
   	},
   	shouldComponentUpdate: function(nextProps, nextState) {
		if(nextProps !== undefined && nextProps.data !== undefined && JSON.stringify(this.props.data) === JSON.stringify(nextProps.data)) {
			return false;
		} 
		return true;
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
});