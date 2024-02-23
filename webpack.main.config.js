const {
  sentryWebpackPlugin
} = require("@sentry/webpack-plugin");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',

  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },

  devtool: "source-map",

  plugins: [sentryWebpackPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: "dota-2-classic",
    project: "launcher"
  })]
};