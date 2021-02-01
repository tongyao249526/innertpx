const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.js')

const devConfig =  {
  mode: 'development',
  devServer: {
    open: true,
    port: 3000,
    compress: true,
    contentBase: 'src', //指定服务器的访问的根目录
    hot: false,
    proxy: {
      '/train': {
        'target': 'https://txxtrainuat.taikang.com',
        'changeOrigin': true
      }
    }
  },
  devtool: 'cheap-module-eval-source-map'
}

module.exports = merge(
  baseConfig, devConfig
)