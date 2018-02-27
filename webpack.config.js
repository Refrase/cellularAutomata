const webpack = require( 'webpack' );

module.exports = function() {

  return {

    entry: './src/index.js',

    output: {
      filename: 'index.js',
      publicPath: 'http://localhost:8080/dist/'
    },

    plugins: [ new webpack.HotModuleReplacementPlugin() ],

    devtool: '#cheap-module-eval-source-map',

    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      ]
    }

  };
};
