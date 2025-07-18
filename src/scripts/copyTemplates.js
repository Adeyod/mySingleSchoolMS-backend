const { ncp } = require('ncp');
const path = require('path');
const fs = require('fs');

// Make sure to keep it as CommonJS (without `export` or `import`)
const sourceDir = path.join(__dirname, '../utils/templates');
const destDir = path.join(__dirname, '../../dist/utils/templates');

// Your copy logic
ncp(sourceDir, destDir, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Templates copied!');
});
