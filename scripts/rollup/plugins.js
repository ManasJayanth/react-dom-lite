const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
// const replace = require('rollup-plugin-replace');

module.exports =  [
  // replace({}),
  json(),
  babel({
    babelrc: false,
    "presets": [
      [
        "flow"
      ],
      [
        "env", {modules: false}
      ],
    ],
    "plugins": [
      "external-helpers"
    ]
  }),
  commonjs()
];
