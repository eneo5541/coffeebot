const path = require('path');

module.exports = {
  entry: ['./index.js'],
  target: 'node',
  output: {
    path: `${process.cwd()}/dist`,
    filename: 'index.js',
    libraryTarget: 'umd'
  }
};
