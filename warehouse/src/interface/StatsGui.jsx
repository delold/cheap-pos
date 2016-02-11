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
			var now = new Date();
			var past = new Date();

			past.setMonth(past.getMonth() - 1);

			return { "fromdate": past, "todate": now, "data": [], "lineset": {
            	labels: [],
            	datasets: [{data: []}]
         	}};
		},
		poll: function() {
			Api.send("getlogs", {"from": this.state.fromdate.getTime(), "to": this.state.todate.getTime()}).then(function(result) {
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
					lineset.labels.push(item.label);
					lineset.datasets[0].data.push(item.sum);
				});
				console.log(lineset);

				this.setState({data: result.data.result, lineset: lineset});
			}.bind(this), function(err) {
				console.log(err);
			});
		},
		componentDidMount: function() {
			this.poll();
		},
		handleChange: function(type, event) {
			var picker = event.currentTarget.winControl;
			var obj = {};
			obj[type] = picker.current;

        	this.setState(obj);
			this.poll();
		},
		render: function() {
			var chart = this.state.data.length > 0 ? <LineChart data={this.state.lineset} options={{responsive: true, animation: false}} /> : null;
			return (<div className="stats">
				<h2 className="win-h2">Denní pohled</h2>
				<div className="form">
					<div className="datepicker">
						<span>Od: </span><ReactWinJS.DatePicker current={this.state.fromdate} onChange={this.handleChange.bind(this, "fromdate")} minYear={1980} maxYear={2050} />
					</div>

					<div className="datepicker">
						<span>Do: </span><ReactWinJS.DatePicker current={this.state.todate} onChange={this.handleChange.bind(this, "todate")} minYear={1980} maxYear={2050} />
					</div>
				</div>

				<div className="linechart">{chart}</div>
			</div>);
		}
	})
}

module.exports = gui;