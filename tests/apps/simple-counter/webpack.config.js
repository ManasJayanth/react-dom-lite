const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  devtool: 'source-map',
  devServer: {
    contentBase: './tests/apps/simple-counter/'
  },
  output: {
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        include: path.resolve(process.cwd(), 'src')
      },
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
