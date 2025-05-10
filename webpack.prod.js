import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

// Convert `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(common, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
  },
  plugins: [new MiniCssExtractPlugin({ filename: "styles.[contenthash].css" })],
  stats: "errors-warnings",
});
