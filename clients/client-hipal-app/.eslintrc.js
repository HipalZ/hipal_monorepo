module.exports = {
  extends: ["next/babel", "next/core-web-vitals", require.resolve("custom")],
  plugins: ["sonarjs"],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
    requireConfigFile: false,
  },
  settings: {
    next: {
      rootDir: __dirname,
    },
    "import/resolver": {
      typescript: {
        project: require.resolve("./tsconfig.json"),
      },
    },
  },
};
