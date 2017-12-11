const glob = require('glob');
const chalk = require('chalk');
const rollup = require('rollup');
const plugins = require('../../rollup/plugins');
const external = require('../../rollup/external');
const { entry, dest } = require('../../rollup/files');
const lint = require('../../lint/eslint');

const inputOptions = {
  input: entry,
  plugins,
  external
};

const outputOptions = {
  file: dest,
  format: 'cjs'
};

console.log(
  chalk.hex('#38AC5F')('Build'),
  'Starting...'
);
console.log(
  chalk.hex('#38AC5F')('ESLint'),
  'Linting...'
);
lint().then(() => {
  console.log(
    chalk.hex('#38AC5F')('ESLint'),
    'Done'
  );
  console.log(
    chalk.hex('#38AC5F')('Rollup'),
    'Bundling...'
  );
  return rollup.rollup(inputOptions)
    .then(bundle => bundle.write(outputOptions))
    .then(() => {
      console.log(
        chalk.hex('#38AC5F')('Rollup'),
        'Done'
      );
      console.log(
        chalk.hex('#38AC5F')('Build'),
        'Finished'
      );
    });
}).catch(e => {
  console.log(
    chalk.hex('#38AC5F')('Build'),
    'Error occured'
  );
  console.log(e.message);
});
