// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
const { ENTRY, DEST } = process.env;

export default {
  input: ENTRY,
  output: { file: DEST, format: 'cjs' },
  plugins: [
    replace({
      BUILD_TARGET: JSON.stringify('node')
    }),
    babel(),
    json(),
    commonjs()
  ],
  external: [
    'nodejs-http-framework',
    'fs',
    'morgan',
    'rotating-file-stream',
    'http',
    'url',
    'crypto',
    'tfp-db'
  ]
};
