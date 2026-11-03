const path = require('path');
module.exports = (_env = {}, { mode = 'production' } = {}) => ({
  mode,
  target: 'browserslist',
  devtool: mode === 'development' ? 'source-map' : false,
  entry: path.resolve(__dirname, 'src/js/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'main.js'
  }
});
