const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  devtool: 'source-map',
  devServer: {
    contentBase: './tests/app'
  },
  output: {
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
