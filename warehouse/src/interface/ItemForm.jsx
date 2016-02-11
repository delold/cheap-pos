var React = require("react");
var ReactDom = require("react-dom");

module.exports = React.createClass({
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
		WinJS.UI.Animation.enterContent(ReactDom.findDOMNode(this.refs.animate)).done();
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
});
