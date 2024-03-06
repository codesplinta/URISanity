const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const { terser } = require('rollup-plugin-terser')
const fs = require('fs')

const env = process.env.NODE_ENV
const isProd = env === 'production'
// const { node } = process.versions
const { version } = fs.readFileSync('./package.json', 'utf8')

const config = {
  input: 'src/index.js',
  external: [],
  output: {
    name: 'urisanity',
    globals: {

    },
    format: 'umd',
    sourcemap: true
    // banner: `/*!\r\n * URISanity: Date=${new Date()};NodeBuildVersion=${parseInt(String(node))}\r\n *\r\n */\r\n`
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js']
    }),
    commonjs(),
    babel({
      exclude: ['node_modules/**']
    }),
    replace({
      exclude: ['node_modules/**'],
      'process.env.NODE_ENV': JSON.stringify(env),
      VERSION: `'${version}'`
    })
  ]
}

if (isProd) {
  config.plugins.push(terser())
}

module.exports = config
