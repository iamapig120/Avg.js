module.exports = {
  devtool: 'source-map',
  entry: './src/entry.js',
  output: {
    path: __dirname,
    filename: 'avg.min.js'
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        },
        exclude: /node_modules/
      }
    ]
  }
}
