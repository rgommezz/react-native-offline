const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  ...tsjPreset,
  preset: "react-native",
  collectCoverage: true,
  setupFiles: ["<rootDir>/test/setupMocks.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/setupTestEnv.ts"],
  modulePathIgnorePatterns: ["<rootDir>/example/"],
  transform: {
    ...tsjPreset.transform,
    "\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  },
  globals: {
    "ts-jest": {
      babelConfig: true
    }
  },
  // This is the only part which you can keep
  // from the above linked tutorial's config:
  cacheDirectory: ".jest/cache"
};
