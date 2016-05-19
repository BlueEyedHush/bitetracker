/* This is not the main file! It's used only for ESLint import plugin (aliases) */

const path = require('path');

module.exports = {
  resolve: {
    alias: {
      SHAREDJS: path.join(__dirname, 'client', 'sharedjs'),
      CLIENT_PATH: path.join(__dirname, 'client'),
    },
  },
};
