const globby = require('globby');
const path = require('path');

async function findSourceFiles(projectPath) {
  const patterns = [
    `${projectPath}/**/*.{js,jsx,ts,tsx}`,
    `!${projectPath}/node_modules/**`,
    `!${projectPath}/**/*.test.{js,ts,jsx,tsx}`
  ];
  const paths = await globby(patterns);
  return paths.map(p => path.resolve(p));
}

module.exports = { findSourceFiles };
