const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    // path: path.resolve(__dirname, "dist"),
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  mode: "development",
  devServer: {
    static: path.resolve(__dirname, "public"),
    port: 3000,
    open: true, // Automatically opens the browser
  },
};
