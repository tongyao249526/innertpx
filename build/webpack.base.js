const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const original = JSON.parse(process.env.npm_config_argv).original
/**
 *  如果打包命令包含dev，则为本地环境 NODE_ENV = dev
 *  若不包含dev则为 测试或正式线上环境
 *    测试线上环境供测试使用NODE_ENV = test
 *    正式线上环境为生产使用NODE_ENV = prod
 * */
const NODE_ENV = original.includes('dev')? 'dev': original[0].includes('.')? original[0].split('.')[1]: original[1].split('.')[1]

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],
  output: {
    path: path.join(__dirname,'../','dist'),
    filename: '[name][contenthash:6].js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: "./src/index.html",
      minify: {
        collapseWhitespace: true
      }
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css'
    }),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(NODE_ENV)
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname,'../','src/assets/imgs'),
        to: 'assets/imgs'
      }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        use:{
          loader: 'url-loader',
          options: {
            limit: 0,
            outputPath: 'assets/imgs',
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.js$/,
        use:{
          loader: 'babel-loader',
        },
        include: path.resolve(__dirname, '../src/')
      },
      {
        test: /\.(htm|html)$/i,
        loader: 'html-withimg-loader'
      }
    ]
  }
}