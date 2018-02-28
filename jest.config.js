module.exports = {
  "testRegex": "/test/.*\\.test\\.js$",
  "moduleDirectories": ["node_modules", "src/"],
  "testPathIgnorePatterns": ["/node_modules/", "/dist/"],
  "setupTestFrameworkScriptFile": "./test/setupTestFramework.js",
  "snapshotSerializers": ["enzyme-to-json/serializer"],
  "verbose": true
};
