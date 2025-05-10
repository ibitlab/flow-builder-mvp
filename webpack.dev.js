import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

// Convert `__dirname` (not available in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(common, {
  mode: "development",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    static: path.resolve(__dirname, "public"),
    historyApiFallback: true,
    port: 3000,
    open: true,
    hot: true,
    liveReload: true,
    watchFiles: ["src/**/*"],
  },
  watch: true,
  stats: "errors-warnings",
});
