var React = require("react");
var ReactWinJS = require("react-winjs");

var FindGui = require("./FindGui.jsx");
var EditGui = require("./EditGui.jsx");
var StatsGui = require("./StatsGui.jsx");

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
				content: EditGui,
				paneOpened: false
			};
		},
		renderContent: function() {
			var callback = function(type, data) {
				if (this.refs.content !== undefined && this.refs.content.handleAction !== undefined) {
					this.refs.content.handleAction(type, data);
				} 
			}.bind(this);

			return (
				<div id="content">
					<this.state.content.Content ref="content" />
					<this.state.content.Toolbar ref="toolbar" callback={callback} />
				</div>
			);
		},
		render: function () {
			var paneComponent = (
				<div>
					<div className="menu">
						<ReactWinJS.SplitViewPaneToggle
							aria-controls={"splitViewApp"}
							paneOpened={this.state.paneOpened}
							onInvoked={this.handleTogglePane} />
						<span className="label">cheappos editor</span>
					</div>
					<ReactWinJS.SplitView.Command
						label="Správa zboží"
						icon="shop"
						onInvoked={this.handleChangeContent.bind(null, EditGui)} />
					<ReactWinJS.SplitView.Command
						label="Statistiky"
						icon="calendarweek"
						onInvoked={this.handleChangeContent.bind(null, StatsGui)} />
				</div>
			);

			var content = this.renderContent();

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
	})
}

module.exports = gui;