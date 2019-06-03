const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: "[name].css",
  chunkFilename: "[id].css"
});

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "index_bundle.js",
    publicPath: "/"
    // filename: "[name].[contenthash].js"
  },
  // optimization: {
  //   runtimeChunk: "single",
  //   splitChunks: {
  //     chunks: "all",
  //     maxInitialRequests: Infinity,
  //     minSize: 0,
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           // get the name. E.g. node_modules/packageName/not/this/part.js
  //           // or node_modules/packageName
  //           const packageName = module.context.match(
  //             /[\\/]node_modules[\\/](.*?)([\\/]|$)/
  //           )[1];

  //           // npm package names are URL-safe, but some servers don't like @ symbols
  //           return `npm.${packageName.replace("@", "")}`;
  //         }
  //       }
  //     }
  //   }
  // },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    noParse: [/moment.js/],
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
              modifyVars: {
                "layout-header-background": "#fff",
                "layout-body-background": "#f4f6f9",
                "font-family": "OpenSans",
                "body-background": "#f4f6f9",
                "menu-bg": "#f4f6f9",
                "menu-item-active-bg": "#f4f6f9",
                "menu-dark-item-active-bg": "#f4f6f9",
                "menu-dark-bg": "#f4f6f9",
                "layout-sider-background": "#f4f6f9"
              }
            }
          }
        ]
      },
      // {
      //   test: /\.svg$/,
      //   use: [
      //     {
      //       loader: "babel-loader"
      //     },
      //     {
      //       loader: "react-svg-loader",
      //       options: {
      //         jsx: true // true outputs JSX tags
      //       }
      //     }
      //   ]
      // },
      // {
      //   test: /\.svg$/,
      //   loader: "svg-inline-loader"
      // },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "/images/"
            }
          }
        ]
      },
      {
        test: /\.ico$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "/images/"
            }
          }
        ]
      },
      {
        test: /\.woff2$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "/fonts/"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    miniCssExtractPlugin,
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
};
