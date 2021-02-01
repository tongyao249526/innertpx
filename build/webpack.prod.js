const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.js')

const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAsses = require('optimize-css-assets-webpack-plugin')

const prodConfig =  {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserJSPlugin({}), new OptimizeCSSAsses({})
    ]
  }
}

module.exports = merge(
  baseConfig, prodConfig
)