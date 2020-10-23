const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (mode = "development") => ({
  rules: [
    {
      test: /\.tsx?$/,
      loader: "ts-loader",
    },
    {
      test: /\.s[ac]ss$/i,
      use: [
        mode === "development" ? "style-loader" : MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            sourceMap: true,
          },
        },
        {
          loader: "sass-loader",
          options: {
            sourceMap: true,
          },
        },
      ],
    },
  ],
});
