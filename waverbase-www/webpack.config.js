var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/entry.jsx',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'app.js',
	},
	module: {
		loaders: [
			// required for react jsx
			{
				test: /\.jsx$/,
				loader: 'babel-loader' ,
				query: {
	        presets: ['es2015', 'react'],
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
	resolveLoader: {
	 alias: {
		 'thrift-loader': path.join(__dirname, "../thrift-loader"),
	 }
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.ejs',
			inject: 'body',
			title: 'Waverbase',
		}),
		new webpack.ProvidePlugin({
			// This is required by many jquery plugins
			jQuery: 'jquery',
			$: 'jquery',
		})
	]
};
