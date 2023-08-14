// @ts-check
require("eslint-config-lostfictions/patch");

/** @type {import('@typescript-eslint/utils/dist').TSESLint.Linter.Config} */
module.exports = {
  extends: ["lostfictions"],
  parserOptions: { tsconfigRootDir: __dirname },
};
