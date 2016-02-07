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
			var label = this.state.content.getLabel();
			var toolbar = this.state.content.getToolbar();
			var content = this.state.content.getContent();

			return (
				<div id="content">
					<div id="toolbar">
						<span>{label}</span>
						<ReactWinJS.ToolBar>{toolbar}</ReactWinJS.ToolBar>
					</div>
					{content}
				</div>
			);
		},
		render: function () {
			var paneComponent = (
				<div>
					<ReactWinJS.SplitViewPaneToggle
							aria-controls={"splitViewApp"}
							paneOpened={this.state.paneOpened}
							onInvoked={this.handleTogglePane} />

					<ReactWinJS.SplitView.Command
						label="Najít zboží"
						icon="find"
						onInvoked={this.handleChangeContent.bind(null, FindGui)} />
					<ReactWinJS.SplitView.Command
						label="Správa zboží"
						icon="edit"
						onInvoked={this.handleChangeContent.bind(null, EditGui)} />
					<ReactWinJS.SplitView.Command
						label="Statistiky"
						icon="view"
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
					closedDisplayMode="inline"
        			openedDisplayMode="inline"
					paneOpened={this.state.paneOpened}
					onAfterClose={this.handleAfterClose} />
			);
		}
	})
}

module.exports = gui;