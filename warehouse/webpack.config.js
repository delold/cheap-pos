var path = require("path");
var webpack = require("webpack");
var htmlpack = require("html-webpack-plugin");

module.exports = {
	devtool: 'cheap-eval-source-map',
	entry: [
		'webpack-dev-server/client?http://localhost:8080',
			'webpack/hot/dev-server',
			'./src/app.js'
	], 
	output: {
		path: path.join(__dirname, "dist"),
		filename: 'bundle.js'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new htmlpack({
			template: './src/index.html'
		})
	],
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /(node_modules|bower_components)/,
			loaders: ["react-hot", "babel?presets[]=react"] 
		}, {
			test: /\.less$/,
			loaders: ["style", "css", "less"]
		}]
	},
	devServer: {
		contentBase: "./dist",
		hot: true
	}
}