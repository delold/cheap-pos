var React = require("react");
var ReactWinJS = require("react-winjs");

var Api = require("../utils/api");

var LineChart = require("react-chartjs").Line;

var gui = {
	Toolbar: React.createClass({
		render: function() {
			return (<ReactWinJS.ToolBar><ReactWinJS.ToolBar.Separator key="separator" /></ReactWinJS.ToolBar>)
		}
	}),
	Content: React.createClass({
		getInitialState: function() {
			return { "data": [], "lineset": {
            	labels: [],
            	datasets: [{data: []}]
         	}};
		},
		componentDidMount: function() {
			Api.send("getlogs", {"from": 1451606400000, "to": 1454198400000}).then(function(result) {

				var lineset = {
				    labels: [],
				    datasets: [
				        {
				            fillColor: "rgba(220,220,220,0.2)",
				            strokeColor: "rgba(220,220,220,1)",
				            pointColor: "rgba(220,220,220,1)",
				            pointStrokeColor: "#fff",
				            pointHighlightFill: "#fff",
				            pointHighlightStroke: "rgba(220,220,220,1)",
				            data: []
				        }
				    ]
				};

				result.data.result.forEach(function(item) {
					console.log(item)
					lineset.labels.push(item.label);
					lineset.datasets[0].data.push(item.sum);
				});

				this.setState({data: result.data.result, lineset: lineset});
			}.bind(this), function(err) {
				console.log(err);
			});
		},
		render: function() {
			var chart = this.state.data.length > 0 ? <LineChart data={this.state.lineset} /> : null;
			return (<div className="stats">
				<h2 className="win-h2">Poslední test měsíc</h2>
				{chart}
			</div>);
		}
	})
}

module.exports = gui;