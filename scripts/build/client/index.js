const webpack = require('webpack');
const config = require('../../webpack/config');

const compiler = webpack(config);

compiler.run((err, stats) => {

  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  console.log(stats.toString({
    chunks: false,  // Makes the build much quieter
    colors: true    // Shows colors in the console
  }));

});
