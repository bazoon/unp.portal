const merge = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
var HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },

  plugins: [
    // new BundleAnalyzerPlugin(),
    // new WebpackBuildNotifierPlugin({
    //   title: "My Project Webpack Build",
    //   // logo: path.resolve("./img/favicon.png"),
    //   suppressSuccess: true
    // }),
    // new webpack.DllPlugin({
    //   name: "[name]",
    //   path: "./build/library/[name].json"
    // }),
    // new HardSourceWebpackPlugin({
    //   // Either an absolute path or relative to webpack's options.context.
    //   cacheDirectory: "node_modules/.cache/hard-source/[confighash]",
    //   // Either a string of object hash function given a webpack config.
    //   configHash: function(webpackConfig) {
    //     // node-object-hash on npm can be used to build this.
    //     return require("node-object-hash")({ sort: false }).hash(webpackConfig);
    //   },
    //   // Either false, a string, an object, or a project hashing function.
    //   environmentHash: {
    //     root: process.cwd(),
    //     directories: [],
    //     files: ["package-lock.json", "yarn.lock"]
    //   },
    //   // An object.
    //   info: {
    //     // 'none' or 'test'.
    //     mode: "none",
    //     // 'debug', 'log', 'info', 'warn', or 'error'.
    //     level: "error"
    //   },
    //   // Clean up large, old caches automatically.
    //   cachePrune: {
    //     // Caches younger than `maxAge` are not considered for deletion. They must
    //     // be at least this (default: 2 days) old in milliseconds.
    //     maxAge: 2 * 24 * 60 * 60 * 1000,
    //     // All caches together must be larger than `sizeThreshold` before any
    //     // caches will be deleted. Together they must be at least this
    //     // (default: 50 MB) big in bytes.
    //     sizeThreshold: 50 * 1024 * 1024
    //   }
    // })
  ]
});
