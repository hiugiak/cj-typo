const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                'targets': {
                  'chrome': '58',
                  'firefox': '45',
                  'ie': '11',
                  'safari': '9'
                },
                'useBuiltIns': 'usage',
                'corejs': 3
              }],
            '@babel/preset-typescript'
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties'
          ],
          sourceMaps: true
        }
      }, {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'cj-typo.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'CJTypo',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'cj-typo.css'
    }),
    new OptimizeCssAssetsPlugin({}),
    new CopyPlugin([
      { from: 'src/*.html', to: '[name].html' }
    ])
  ]
};