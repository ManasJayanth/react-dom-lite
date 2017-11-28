const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');

module.exports =  [
  replace({
    BUILD_TARGET: JSON.stringify('node')
  }),
  json(),
  babel({
    runtimeHelpers: true
  }),
  commonjs()
];
