const glob = require('glob');
const chalk = require('chalk');
const rollup = require('rollup');
const plugins = require('../../rollup/plugins');
const external = require('../../rollup/external');
const { entry, dest } = require('../../rollup/files');

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
  chalk.hex('#38AC5F')('Rollup'),
  'Starting...'
);
rollup.rollup(inputOptions)
  .then(bundle => bundle.write(outputOptions))
  .then(() => {
    console.log(
      chalk.hex('#38AC5F')('Rollup'),
      'Done'
    );
  }).catch(e => {
    console.log(
      chalk.hex('#38AC5F')('Rollup'),
      'Error occured'
    );
    console.log(e);
  });
