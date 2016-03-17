var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['babel-polyfill', './src/entry.jsx'],
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'app.js',
	},
	module: {
		loaders: [
			// required for react jsx
			{
				test: /\.jsx$/,
				loader: 'babel-loader',
				query: {
	        presets: ['es2015', 'react'],
      	},
			},
			{
				test: /src\/.*\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015'],
				},
			},
			{
				test: /\.css$/,
				loader: 'style!css',
			},
			{
				test: /\.(png|woff|woff2|eot|ttf|svg)$/,
				loader: 'url-loader?limit=100000',
			},
		],
	},
	resolve: {
		alias: {
			thrift: path.join(__dirname, './thrift.js'),
			jquery: path.join(__dirname, './node_modules/jquery'),
		}
	},
	resolveLoader: {
	 root: path.join(__dirname, './node_modules'),
	 modulesDirectories: ['../'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.ejs',
			inject: 'body',
			title: 'Waverbase',
		}),
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
			$: 'jquery',
		})
	]
};
