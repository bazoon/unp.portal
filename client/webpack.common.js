const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: "[name].css",
  chunkFilename: "[id].css"
});

const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "index_bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
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
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    miniCssExtractPlugin
  ]
};