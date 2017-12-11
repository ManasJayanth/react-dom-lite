const chalk = require('chalk');
const nodeGlob = require('glob');
const { CLIEngine } = require('eslint');

const resolveGlob = pattern => {
  return new Promise((resolve, reject) => {
    nodeGlob(pattern, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    })
  });
};


function lint (filePath) {
  const cli = new CLIEngine();
  const report = cli.executeOnFiles([filePath]);
  const formatter = cli.getFormatter();
  const formatterOutput = formatter(report.results);
  if (formatterOutput !== '') {
    throw new Error(formatterOutput);
  }
};

module.exports = () => {
  return resolveGlob('src/**/*.js').then(files => {
    files.forEach(lint);
  });
};
