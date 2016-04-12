var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin', ].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: ['babel-polyfill', './src/test-entry.js', ],
  target: 'node',
	module: {
		loaders: [
			{
				test: /src\/.*\.js$/,
				loader: 'babel-loader',
        query: {
          presets: [
            'es2015', 'react',
          ],
        },
      },
    ],
  },
	resolveLoader: {
	 root: path.join(__dirname, './node_modules'),
	 modulesDirectories: ['../', ],
	},
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'test-backend.js',
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false,  }),
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
			$: 'jquery',
		}),
  ],
  devtool: 'sourcemap',
}
