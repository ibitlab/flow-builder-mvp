import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ESLintPlugin from "eslint-webpack-plugin";

console.log("process.env.NODE_ENV===", process.env.NODE_ENV);
const devMode = process.env.NODE_ENV !== "production";

export default {
  entry: "./src/index.js",
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: "babel-loader" },
      {
        test: /\.module\.css$/, // Handles CSS Modules
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              esModule: true,
              modules: {
                // namedExport: false,
                exportLocalsConvention: "camel-case-only",
                localIdentName: devMode
                  ? "[name]__[local]__[hash:base64:5]"
                  : "[local]__[hash:base64:5]", // Custom class name format
              },
            },
          },
        ],
      },
      {
        test: /\.css$/, // Handles global styles
        exclude: /\.module\.css$/, // Avoid processing CSS Modules twice
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      { test: /\.(png|jpg|gif)$/, type: "asset/resource" }, // Optimized handling
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new ESLintPlugin({
      extensions: ["js", "ts"],
      emitWarning: true,
      failOnError: false,
    }),
  ],
};
