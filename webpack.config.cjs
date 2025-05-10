const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  mode: "development",
  stats: "errors-warnings", // Ensure only errors & warnings show
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: "babel-loader" },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      { test: /\.(png|jpg|gif)$/, use: "file-loader" },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      // scriptLoading: "blocking",
      // inject: true, // Ensures Webpack injects scripts
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "styles.css" }),
    new ESLintPlugin({
      extensions: ["js", "ts"],
      emitWarning: true,
      failOnError: false, // Prevents Webpack from stopping
    }),
  ],
  watch: true,
  devServer: {
    static: path.resolve(__dirname, "build"),
    // static: {
    //   directory: path.resolve(__dirname, "public"), // Serve from `public`
    //   // serveIndex: true, // Allow serving files directly
    // },
    historyApiFallback: true, // Ensures `index.html` is served instead of a file listing
    port: 3000,
    open: true,
    hot: true,
    liveReload: true,
    watchFiles: ["src/**/*"], // Ensures Webpack watches your source files
  },
};
