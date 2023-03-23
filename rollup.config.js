/* eslint-env node */
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
import nodeResolve from '@rollup/plugin-node-resolve';

const pkg = require('./package.json');
const nonbundledDependencies = Object.keys({ ...pkg.dependencies });

module.exports = {
  input: 'lib/index.js',
  output: [ {
    file: pkg.main,
    format: 'cjs'
  },
  {
    file: pkg.module,
    format: 'esm'
  } ],
  plugins: [
    commonjs(),
    json(),
    nodeResolve(),
  ],
  external: nonbundledDependencies
};
