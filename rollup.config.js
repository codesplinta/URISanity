const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');
const fs = require('fs');

const env = process.env.NODE_ENV;
const isProd = env === 'production';
const { node, npm } = process.versions
const { version } = fs.readFileSync('./package.json', 'utf8')

const config = {
  input: 'src/index.js',
  external: [],
  output: {
    name: 'URISanity',
    globals: {},
    format: 'umd',
    sourcemap: true,
    banner: `URISanity: Node Version=${node}; NPM Version=${npm}`,
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: ['**/node_modules/**'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      VERSION: `'${version}'`,
    }),
  ],
};

if (isProd) {
  config.plugins.push(terser());
}

module.exports = config;
